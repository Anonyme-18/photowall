import { useState } from "react";
import { Eye, EyeOff, Trash2, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "@/context/AppContext";
import { LazyImage } from "../LazyImage";

type Filter = "all" | "visible" | "hidden";

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

export function DashboardPhotos() {
  const { photos, toggleHide, deletePhoto } = useAppContext();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = photos
    .filter((p) => {
      if (filter === "visible") return !p.hidden;
      if (filter === "hidden") return p.hidden;
      return true;
    })
    .filter((p) => !search || p.author.toLowerCase().includes(search.toLowerCase()));

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all",     label: "Toutes",   count: photos.length },
    { id: "visible", label: "Visibles", count: photos.filter((p) => !p.hidden).length },
    { id: "hidden",  label: "Masquées", count: photos.filter((p) => p.hidden).length },
  ];

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1a1512" }}>Gestion des photos</h1>
        <p style={{ fontSize: "0.82rem", color: "#7a6f65", marginTop: "2px" }}>
          {photos.length} photo{photos.length > 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex items-center bg-black/[0.06] rounded-xl p-0.5 gap-0.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: filter === f.id ? "white" : "transparent",
                color: filter === f.id ? "#1a1512" : "#7a6f65",
                fontSize: "0.8rem",
                fontWeight: filter === f.id ? 600 : 400,
                boxShadow: filter === f.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {f.label}
              <span
                className="px-1.5 py-0.5 rounded-full"
                style={{
                  background: filter === f.id ? "#f5c842" : "rgba(0,0,0,0.08)",
                  color: filter === f.id ? "#1a1512" : "#7a6f65",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-1 min-w-[160px]"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <Search size={14} style={{ color: "#b0b0b0" }} strokeWidth={2} />
          <input
            type="text"
            placeholder="Rechercher par prénom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "0.82rem", color: "#1a1512" }}
          />
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(0,0,0,0.04)" }}>
          <Filter size={13} style={{ color: "#7a6f65" }} strokeWidth={2} />
          <span style={{ fontSize: "0.75rem", color: "#7a6f65" }}>{filtered.length} résultats</span>
        </div>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <AnimatePresence>
          {filtered.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="relative group rounded-xl overflow-hidden bg-gray-100"
              style={{
                aspectRatio: "1",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <LazyImage
                src={photo.url}
                alt={photo.author || "Photo"}
                style={{
                  width: "100%", height: "100%", aspectRatio: undefined,
                  filter: photo.hidden ? "grayscale(70%) brightness(0.7)" : "none",
                }}
              />

              {/* Overlay */}
              <div
                className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%)" }}
              >
                {/* Top: action buttons */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => toggleHide(photo.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: "rgba(255,255,255,0.9)", color: photo.hidden ? "#22c55e" : "#7a6f65" }}
                    title={photo.hidden ? "Rendre visible" : "Masquer"}
                  >
                    {photo.hidden ? <Eye size={13} strokeWidth={2.5} /> : <EyeOff size={13} strokeWidth={2.5} />}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(photo.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: "rgba(239,68,68,0.9)", color: "white" }}
                    title="Supprimer"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Bottom: author */}
                <div>
                  {photo.author && (
                    <p style={{ color: "white", fontSize: "0.72rem", fontWeight: 600, fontFamily: "'Caveat', cursive" }}>
                      {photo.author}
                    </p>
                  )}
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.62rem" }}>
                    {timeAgo(photo.timestamp)}
                  </p>
                </div>
              </div>

              {/* Hidden badge */}
              {photo.hidden && (
                <div
                  className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full pointer-events-none"
                  style={{ background: "rgba(239,68,68,0.85)", color: "white", fontSize: "0.6rem", fontWeight: 700 }}
                >
                  <EyeOff size={8} strokeWidth={2.5} />
                  Masqué
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3 opacity-50">
          <Search size={32} strokeWidth={1.2} style={{ color: "#7a6f65" }} />
          <p style={{ color: "#7a6f65", fontSize: "0.88rem" }}>Aucune photo ne correspond</p>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <Trash2 size={18} style={{ color: "#ef4444" }} strokeWidth={2} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1512" }}>Supprimer la photo ?</h3>
                  <p style={{ fontSize: "0.75rem", color: "#7a6f65" }}>Cette action est irréversible.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl transition-all hover:bg-gray-100"
                  style={{ fontSize: "0.85rem", fontWeight: 600, color: "#7a6f65", border: "1.5px solid rgba(0,0,0,0.1)" }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => { deletePhoto(confirmDelete); setConfirmDelete(null); }}
                  className="flex-1 py-2.5 rounded-xl transition-all hover:opacity-90"
                  style={{ fontSize: "0.85rem", fontWeight: 700, background: "#ef4444", color: "white" }}
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
