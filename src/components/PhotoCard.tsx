import { useState } from "react";
import { EyeOff, Eye, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Photo } from "./types";

interface PhotoCardProps {
  photo: Photo;
  onToggleHide: (id: string) => void;
  isAdmin?: boolean;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

export function PhotoCard({ photo, onToggleHide, isAdmin = true }: PhotoCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: photo.hidden ? 0.35 : 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative group rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0 12px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        background: "#f3f3f5",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Skeleton */}
      {!imgLoaded && (
        <div
          className="w-full animate-pulse"
          style={{
            aspectRatio: photo.aspectRatio ? `${photo.aspectRatio}` : "4/3",
            background: "linear-gradient(90deg, #e9ebef 25%, #f3f3f5 50%, #e9ebef 75%)",
          }}
        />
      )}

      {/* Image */}
      <img
        src={photo.url}
        alt={photo.author ? `Photo de ${photo.author}` : "Photo de l'événement"}
        className="w-full block"
        style={{
          display: imgLoaded ? "block" : "none",
          filter: photo.hidden ? "grayscale(80%)" : "none",
        }}
        onLoad={() => setImgLoaded(true)}
      />

      {/* Overlay on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex flex-col justify-between p-3"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
            }}
          >
            {/* Top: admin controls */}
            {isAdmin && (
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHide(photo.id);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-95"
                  style={{
                    background: photo.hidden
                      ? "rgba(26,21,18,0.9)"
                      : "rgba(0,0,0,0.55)",
                    color: "white",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                  title={photo.hidden ? "Afficher" : "Masquer"}
                >
                  {photo.hidden ? (
                    <>
                      <Eye size={11} strokeWidth={2.5} />
                      <span>Afficher</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={11} strokeWidth={2.5} />
                      <span>Masquer</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Bottom: author + time */}
            <div className="flex items-end justify-between gap-2">
              {photo.author && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{
                      background: "#1a1512",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                    }}
                  >
                    {photo.author.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-white truncate max-w-[100px]"
                    style={{ fontSize: "0.75rem", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                  >
                    {photo.author}
                  </span>
                </div>
              )}
              <div
                className="flex items-center gap-1 text-white/80 ml-auto shrink-0"
                style={{ fontSize: "0.65rem" }}
              >
                <Clock size={10} strokeWidth={2} />
                <span>{timeAgo(photo.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden badge */}
      {photo.hidden && (
        <div
          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(0,0,0,0.6)",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 600,
          }}
        >
          <EyeOff size={9} strokeWidth={2.5} />
          <span>Masqué</span>
        </div>
      )}
    </motion.div>
  );
}
