import { useEffect, useRef } from "react";
import Masonry from "react-responsive-masonry";
import ResponsiveMasonry from "react-responsive-masonry";
import { AnimatePresence } from "motion/react";
import { ImageIcon, Loader2 } from "lucide-react";
import { PhotoCard } from "./PhotoCard";
import type { Photo } from "./types";

interface PhotoWallProps {
  photos: Photo[];
  showHidden: boolean;
  onToggleHide: (id: string) => void;
  isLoading?: boolean;
}

export function PhotoWall({ photos, showHidden, onToggleHide, isLoading = false }: PhotoWallProps) {
  const prevCountRef = useRef(photos.length);

  useEffect(() => {
    prevCountRef.current = photos.length;
  }, [photos.length]);

  const visiblePhotos = showHidden ? photos : photos.filter((p) => !p.hidden);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2
          size={32}
          strokeWidth={2}
          className="animate-spin"
          style={{ color: "#7c3aed" }}
        />
        <p style={{ color: "#717182", fontSize: "0.9rem" }}>Chargement des photos…</p>
      </div>
    );
  }

  if (visiblePhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(37,99,235,0.1))" }}
        >
          <ImageIcon size={36} style={{ color: "#7c3aed" }} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p style={{ fontWeight: 600, color: "#0f0f1a", fontSize: "1rem" }}>
            Aucune photo pour l'instant
          </p>
          <p style={{ color: "#717182", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Soyez le premier à immortaliser l'événement !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 320: 1, 480: 2, 768: 3, 1024: 4, 1280: 5 }}
      >
        <Masonry gutter="12px">
          <AnimatePresence>
            {visiblePhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onToggleHide={onToggleHide}
                isAdmin={true}
              />
            ))}
          </AnimatePresence>
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
