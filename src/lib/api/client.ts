import type { Photo } from "@/components/types";
import type { EventConfig } from "@/lib/types/event";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Erreur serveur");
  }
  return data as T;
}

export async function fetchPhotos(): Promise<Photo[]> {
  const res = await fetch("/api/photos", { cache: "no-store" });
  const data = await parseJson<{ photos: Array<Omit<Photo, "timestamp"> & { timestamp: string }> }>(res);
  return data.photos.map((p) => ({ ...p, timestamp: new Date(p.timestamp) }));
}

export async function createPhoto(payload: {
  image?: Blob;
  url?: string;
  author: string;
  aspectRatio: number;
  accentColor?: string;
  x?: number;
  y?: number;
}): Promise<Photo> {
  let res: Response;

  if (payload.image) {
    const form = new FormData();
    form.append("image", payload.image, "photo.jpg");
    form.append("author", payload.author);
    form.append("aspectRatio", String(payload.aspectRatio));
    if (payload.accentColor) form.append("accentColor", payload.accentColor);
    if (payload.x != null) form.append("x", String(payload.x));
    if (payload.y != null) form.append("y", String(payload.y));

    res = await fetch("/api/photos", { method: "POST", body: form });
  } else {
    res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  const data = await parseJson<{ photo: Omit<Photo, "timestamp"> & { timestamp: string } }>(res);
  return { ...data.photo, timestamp: new Date(data.photo.timestamp) };
}

export async function patchPhoto(
  id: string,
  updates: Partial<Pick<Photo, "hidden" | "x" | "y" | "rotation">>,
): Promise<Photo> {
  const res = await fetch(`/api/photos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await parseJson<{ photo: Omit<Photo, "timestamp"> & { timestamp: string } }>(res);
  return { ...data.photo, timestamp: new Date(data.photo.timestamp) };
}

export async function removePhoto(id: string): Promise<void> {
  const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
  await parseJson(res);
}

export async function fetchEventConfig(): Promise<EventConfig> {
  const res = await fetch("/api/event-config", { cache: "no-store" });
  const data = await parseJson<{ config: EventConfig }>(res);
  return data.config;
}

export async function saveEventConfig(config: EventConfig): Promise<EventConfig> {
  const res = await fetch("/api/event-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config }),
  });
  const data = await parseJson<{ config: EventConfig }>(res);
  return data.config;
}
