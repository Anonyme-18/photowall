import type { Photo } from "@/components/types";

export interface PhotoRow {
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
}

export function rowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    url: row.url,
    author: row.author,
    timestamp: new Date(row.timestamp),
    hidden: row.hidden,
    aspectRatio: row.aspect_ratio,
    accentColor: row.accent_color ?? undefined,
    x: row.x ?? undefined,
    y: row.y ?? undefined,
    rotation: row.rotation ?? 0,
  };
}

export function photoToRow(photo: Photo): PhotoRow {
  return {
    id: photo.id,
    url: photo.url,
    author: photo.author,
    timestamp: photo.timestamp.toISOString(),
    hidden: photo.hidden,
    aspect_ratio: photo.aspectRatio,
    accent_color: photo.accentColor ?? null,
    x: photo.x ?? null,
    y: photo.y ?? null,
    rotation: photo.rotation ?? 0,
  };
}

export { DEFAULT_EVENT_CONFIG } from "@/lib/types/event";

export function randomPhotoPosition() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 120 + Math.random() * 180;
  return {
    x: Math.cos(angle) * radius - 80,
    y: Math.sin(angle) * radius - 100,
  };
}

export async function uploadPhotoBuffer(
  buffer: Buffer,
  contentType: string,
  photoId: string,
): Promise<string> {
  const { uploadStorageObject, getPublicStorageUrl } = await import("@/lib/supabase/admin");

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const path = `${photoId}.${ext}`;

  await uploadStorageObject("photos", path, buffer, contentType);
  return getPublicStorageUrl("photos", path);
}

export async function uploadPhotoImage(dataUrl: string, photoId: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error("Format d'image invalide");

  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  return uploadPhotoBuffer(buffer, contentType, photoId);
}
