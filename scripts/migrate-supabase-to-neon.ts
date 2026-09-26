import { neon } from "@neondatabase/serverless";
import { UTApi, UTFile } from "uploadthing/server";

type SupabasePhoto = {
  id: string;
  url: string;
  author: string;
  timestamp: string;
  hidden: boolean;
  aspect_ratio: number;
  accent_color: string | null;
  x: number | null;
  y: number | null;
  rotation?: number;
};

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const neonSql = neon(required("DATABASE_URL"));
const supabaseUrl = required("SUPABASE_MIGRATION_URL").replace(/\/$/, "");
const supabaseKey = required("SUPABASE_MIGRATION_SERVICE_ROLE_KEY");
const utapi = new UTApi({ token: required("UPLOADTHING_TOKEN"), logLevel: "Error" });

async function supabaseGet<T>(path: string): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

async function migrateFile(photo: SupabasePhoto): Promise<{ url: string; key: string | null }> {
  const marker = "/storage/v1/object/public/photos/";
  const index = photo.url.indexOf(marker);
  if (index === -1) return { url: photo.url, key: null };

  const key = decodeURIComponent(photo.url.slice(index + marker.length));
  const response = await fetch(photo.url);
  if (!response.ok) throw new Error(`Unable to download ${photo.id}: ${response.status}`);
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error(`Unsupported content type for ${photo.id}: ${contentType}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > 10 * 1024 * 1024) throw new Error(`File too large: ${photo.id}`);

  const result = await utapi.uploadFiles(
    new UTFile([buffer], key.split("/").pop() ?? `${photo.id}.jpg`, { type: contentType, customId: photo.id }),
    { acl: "public-read" },
  );
  if (!result.data) throw new Error(`UploadThing upload failed for ${photo.id}`);
  return { url: result.data.ufsUrl, key: result.data.key };
}

async function main() {
  const photos = await supabaseGet<SupabasePhoto[]>(
    "photos?select=id,url,author,timestamp,hidden,aspect_ratio,accent_color,x,y,rotation&order=timestamp.desc",
  );
  const [event] = await supabaseGet<Array<{ config: unknown }>>("event_config?select=config&id=eq.1");

  if (event) {
    await neonSql`
      INSERT INTO event_config (id, config) VALUES (1, ${JSON.stringify(event.config)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config
    `;
  }

  for (const photo of photos) {
    const [existing] = await neonSql`SELECT url, storage_key FROM photos WHERE id = ${photo.id}`;
    const image = existing?.storage_key
      ? { url: String(existing.url), key: String(existing.storage_key) }
      : await migrateFile(photo);
    await neonSql`
      INSERT INTO photos (id, url, storage_key, author, timestamp, hidden, aspect_ratio, accent_color, x, y, rotation)
      VALUES (${photo.id}, ${image.url}, ${image.key}, ${photo.author}, ${photo.timestamp}, ${photo.hidden}, ${photo.aspect_ratio}, ${photo.accent_color}, ${photo.x}, ${photo.y}, ${photo.rotation ?? 0})
      ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, storage_key = EXCLUDED.storage_key,
        author = EXCLUDED.author, timestamp = EXCLUDED.timestamp, hidden = EXCLUDED.hidden,
        aspect_ratio = EXCLUDED.aspect_ratio, accent_color = EXCLUDED.accent_color,
        x = EXCLUDED.x, y = EXCLUDED.y, rotation = EXCLUDED.rotation
    `;
    console.log(`Migrated ${photo.id}`);
  }

  console.log(`Migration complete: ${photos.length} photos`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
