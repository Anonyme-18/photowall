import { useState, memo } from "react";
import { EyeOff, Eye, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { Photo } from "./types";
import { LazyImage } from "./LazyImage";

const TILT_STEP = 4;
const MAX_TILT = 18;
const MIN_TILT = -18;

interface PolaroidCardProps {
  photo: Photo;
  rotation: number;
  onToggleHide: (id: string) => void;
  isAdmin?: boolean;
  eventName?: string;
  dragging?: boolean;
  focused?: boolean;
  isUserPhoto?: boolean;
  onDelete?: () => void;
  onTilt?: (rotation: number) => void;
}

const DEFAULT_COLOR = "#f5c842";

function ToolbarButton({
  title,
  onClick,
  children,
  danger,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      data-no-drag
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
      style={{
        width: 32,
        height: 32,
        background: "white",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        color: danger ? "#ef4444" : "#1a1512",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export const PolaroidCard = memo(function PolaroidCard({
  photo,
  rotation,
  onToggleHide,
  isAdmin = true,
  eventName = "Photowall",
  dragging = false,
  focused = false,
  isUserPhoto = false,
  onDelete,
  onTilt,
}: PolaroidCardProps) {
  const [hovered, setHovered] = useState(false);
  const accent = photo.accentColor ?? DEFAULT_COLOR;

  const isLight = accent === "#f5c842" || accent === "#f0ebe4" || accent === "#27c93f";
  const textOnAccent = isLight ? "#1a1512" : "white";

  const displayRotation = focused ? 0 : rotation;

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: photo.hidden ? 0.38 : 1,
        scale: dragging ? 1.05 : focused ? 1.06 : hovered ? 1.03 : 1,
        rotate: displayRotation,
        y: dragging ? -4 : focused ? -6 : hovered ? -4 : 0,
      }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={
        dragging
          ? { duration: 0 }
          : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }
      onMouseEnter={() => !dragging && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-block select-none"
      style={{
        zIndex: isUserPhoto ? 15 : hovered || dragging || focused ? 20 : 1,
        filter: photo.hidden ? "grayscale(70%)" : "none",
        pointerEvents: dragging ? "none" : "auto",
        cursor: isUserPhoto ? (dragging ? "grabbing" : "grab") : "pointer",
        outline: isUserPhoto && (hovered || focused) ? "2px solid #7c3aed" : "none",
        outlineOffset: 4,
        borderRadius: 2,
        overflow: "visible",
      }}
    >
      <div className="relative inline-block">
        {/* Toolbar permanente — photos ajoutées par l'utilisateur */}
        {isUserPhoto && (
          <div
            data-photo-toolbar
            className="absolute flex flex-col gap-1.5"
            style={{
              right: -42,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 40,
            }}
          >
            <ToolbarButton
              title="Incliner à gauche"
              onClick={() => onTilt?.(Math.max(MIN_TILT, rotation - TILT_STEP))}
            >
              <RotateCcw size={15} strokeWidth={2.2} />
            </ToolbarButton>
            <ToolbarButton
              title="Incliner à droite"
              onClick={() => onTilt?.(Math.min(MAX_TILT, rotation + TILT_STEP))}
            >
              <RotateCw size={15} strokeWidth={2.2} />
            </ToolbarButton>
            <ToolbarButton
              title="Supprimer"
              danger
              onClick={() => {
                if (window.confirm("Supprimer cette photo du mur ?")) onDelete?.();
              }}
            >
              <Trash2 size={15} strokeWidth={2.2} />
            </ToolbarButton>
          </div>
        )}

      {/* Polaroid frame */}
      <div
        className="flex flex-col bg-white"
        style={{
          width: "clamp(130px, 20vw, 190px)",
          boxShadow: dragging
            ? "0 24px 56px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.16)"
            : focused
              ? "0 28px 60px rgba(0,0,0,0.3), 0 10px 24px rgba(0,0,0,0.18)"
              : hovered
                ? "0 20px 48px rgba(0,0,0,0.26), 0 4px 12px rgba(0,0,0,0.12)"
                : "0 4px 18px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
          transition: dragging ? "none" : "box-shadow 0.45s ease",
        }}
      >
        <div
          className="flex items-center justify-center px-2"
          style={{
            background: accent,
            height: "28px",
            borderBottom: `1.5px solid ${accent}`,
          }}
        >
          <span
            style={{
              fontFamily: "'Bangers', cursive",
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              color: textOnAccent,
              textTransform: "uppercase",
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {eventName}
          </span>
        </div>

        <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1", margin: "6px 6px 0" }}>
          <LazyImage
            src={photo.url}
            alt={photo.author ? `Photo de ${photo.author}` : "Photo de l'événement"}
            style={{ width: "100%", height: "100%", objectFit: "cover", aspectRatio: undefined }}
          />

          {isAdmin && !isUserPhoto && hovered && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleHide(photo.id); }}
              className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded transition-all"
              style={{ background: "rgba(0,0,0,0.62)", color: "white", fontSize: "0.58rem", fontWeight: 600 }}
            >
              {photo.hidden ? <Eye size={9} strokeWidth={2.5} /> : <EyeOff size={9} strokeWidth={2.5} />}
              {photo.hidden ? "Voir" : "Cacher"}
            </button>
          )}
        </div>

        <div
          className="flex items-center justify-center"
          style={{ height: "34px", padding: "0 8px" }}
        >
          <span
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "0.95rem",
              color: "#3d3530",
              textAlign: "center",
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {photo.author || " "}
          </span>
        </div>
      </div>
      </div>
    </motion.div>
  );
});
