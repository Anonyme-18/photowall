import { Plus, Crosshair, LayoutGrid, ZoomIn, ZoomOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface BottomBarProps {
  onAddPhoto: () => void;
  onOverview: () => void;
  onRecenter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
  newPhotoCount: number;
  showWallControls: boolean;
}

export function BottomBar({
  onAddPhoto,
  onOverview,
  onRecenter,
  onZoomIn,
  onZoomOut,
  zoom,
  newPhotoCount,
  showWallControls,
}: BottomBarProps) {
  return (
    <div
      className="shrink-0 flex items-center justify-between px-4 sm:px-6 gap-3"
      style={{
        height: "72px",
        background: "rgba(240,235,228,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        zIndex: 40,
      }}
    >
      {/* Left: canvas controls */}
      <div className="flex items-center gap-1.5">
        {showWallControls && (
          <>
            <button
              onClick={onRecenter}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all hover:bg-black/[0.06] active:scale-95"
              style={{ fontSize: "0.8rem", fontWeight: 600, color: "#3d3530", border: "1.5px solid rgba(0,0,0,0.1)", background: "white" }}
              title="Recentrer la vue"
            >
              <Crosshair size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Recentrer</span>
            </button>

            <button
              onClick={onOverview}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all hover:bg-black/[0.06] active:scale-95"
              style={{ fontSize: "0.8rem", fontWeight: 600, color: "#3d3530", border: "1.5px solid rgba(0,0,0,0.1)", background: "white" }}
              title="Vue d'ensemble"
            >
              <LayoutGrid size={14} strokeWidth={2} />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </button>

            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{ border: "1.5px solid rgba(0,0,0,0.1)", background: "white" }}
            >
              <button
                onClick={onZoomOut}
                className="flex items-center justify-center w-8 h-8 transition-all hover:bg-black/[0.05] active:scale-90"
                title="Dézoomer"
              >
                <ZoomOut size={14} strokeWidth={2} style={{ color: "#3d3530" }} />
              </button>
              <span
                className="px-2 text-center select-none"
                style={{ fontSize: "0.72rem", fontWeight: 700, color: "#3d3530", minWidth: "36px" }}
              >
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={onZoomIn}
                className="flex items-center justify-center w-8 h-8 transition-all hover:bg-black/[0.05] active:scale-90"
                title="Zoomer"
              >
                <ZoomIn size={14} strokeWidth={2} style={{ color: "#3d3530" }} />
              </button>
            </div>
          </>
        )}

        <AnimatePresence>
          {newPhotoCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.07)", fontSize: "0.72rem", fontWeight: 600, color: "#3d3530" }}
            >
              +{newPhotoCount} nouveau{newPhotoCount > 1 ? "x" : ""}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onAddPhoto}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95 shrink-0"
        style={{
          background: "#f5c842",
          color: "#1a1512",
          fontSize: "0.88rem",
          fontWeight: 700,
          boxShadow: "0 4px 14px rgba(245,200,66,0.4)",
        }}
      >
        <Plus size={16} strokeWidth={2.8} />
        Ajouter une photo
      </button>
    </div>
  );
}
