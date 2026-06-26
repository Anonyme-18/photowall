import type { Photo } from "@/components/types";

/** Empreinte légère pour éviter les re-renders inutiles au polling. */
export function photosFingerprint(photos: Photo[]): string {
  return photos
    .map(
      (p) =>
        `${p.id}|${p.hidden}|${p.x ?? ""}|${p.y ?? ""}|${p.rotation ?? 0}|${p.url}|${p.author}`,
    )
    .join("\n");
}

export function mergePhotosIfChanged(prev: Photo[], next: Photo[]): Photo[] {
  return photosFingerprint(prev) === photosFingerprint(next) ? prev : next;
}
