import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function sanitizeSupabaseKey(key: string): string {
  return key.trim().replace(/^["']|["']$/g, "");
}

export function resolveSupabaseKey(): string {
  const raw =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "";
  return sanitizeSupabaseKey(raw);
}

export function resolveSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.trim().replace(/\/$/, "");
}

/** Les clés sb_secret_ / sb_publishable_ ne sont pas des JWT. */
export function isOpaqueSupabaseKey(key: string): boolean {
  return key.startsWith("sb_");
}

function supabaseAuthHeaders(key: string): HeadersInit {
  const headers: Record<string, string> = { apikey: key };
  if (!isOpaqueSupabaseKey(key)) {
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("apikey", supabaseKey);

    if (isOpaqueSupabaseKey(supabaseKey)) {
      headers.delete("Authorization");
    } else {
      headers.set("Authorization", `Bearer ${supabaseKey}`);
    }

    return fetch(input, { ...init, headers });
  };
}

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();

  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes. Configurez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (Secret key sb_secret_...).",
    );
  }

  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ne doit pas être une clé publishable (sb_publishable_). Utilisez la Secret key (sb_secret_...).",
    );
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: createSupabaseFetch(key),
    },
  });

  return adminClient;
}

/** Upload Storage via REST — évite l'erreur JWS avec les clés sb_secret_. */
export async function uploadStorageObject(
  bucket: string,
  objectPath: string,
  body: Uint8Array | ArrayBuffer,
  contentType: string,
): Promise<void> {
  const baseUrl = resolveSupabaseUrl();
  const key = resolveSupabaseKey();

  if (!baseUrl || !key) {
    throw new Error("Supabase non configuré pour le stockage.");
  }

  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const res = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      ...supabaseAuthHeaders(key),
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: body instanceof Uint8Array ? body : new Uint8Array(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Storage upload failed (${res.status}): ${detail}`);
  }
}

export function getPublicStorageUrl(bucket: string, objectPath: string): string {
  const baseUrl = resolveSupabaseUrl();
  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export async function removeStorageObject(bucket: string, objectPath: string): Promise<void> {
  const baseUrl = resolveSupabaseUrl();
  const key = resolveSupabaseKey();

  if (!baseUrl || !key) return;

  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const res = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "DELETE",
    headers: supabaseAuthHeaders(key),
  });

  if (!res.ok && res.status !== 404) {
    const detail = await res.text();
    throw new Error(`Storage delete failed (${res.status}): ${detail}`);
  }
}
