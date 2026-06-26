import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Photo } from "./types";
import { useMusicPlayer } from "./useMusicPlayer";
import { MusicBar } from "./MusicBar";

interface SlideshowModeProps {
  photos: Photo[];
  onClose: () => void;
}

const SLIDE_DURATION = 5000;

export function SlideshowMode({ photos, onClose }: SlideshowModeProps) {
  const visible = photos.filter((p) => !p.hidden);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  const music = useMusicPlayer(true);

  const goTo = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setIndex(((next % visible.length) + visible.length) % visible.length);
    },
    [visible.length]
  );

  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);

  useEffect(() => {
    if (!playing || visible.length === 0) return;
    const timer = setInterval(() => next(), SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [playing, next, visible.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, next, prev]);

  if (visible.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black gap-4">
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem" }}>
          Aucune photo à afficher
        </p>
        <button onClick={onClose} className="text-white underline" style={{ fontSize: "0.85rem" }}>
          Fermer
        </button>
      </div>
    );
  }

  const current = visible[index];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col" style={{ userSelect: "none" }}>
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#1a1512" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div>
            <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", fontFamily: "'Bangers', cursive", letterSpacing: "0.06em" }}>CONFIG</span>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
              {index + 1} / {visible.length}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
          style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "white" }}
        >
          <X size={17} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      {playing && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-white/10">
          <motion.div
            key={index}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
            className="h-full"
            style={{ background: "#1a1512" }}
          />
        </div>
      )}

      {/* Main photo */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <img
              src={current.url}
              alt={current.author ? `Photo de ${current.author}` : "Photo de l'événement"}
              className="max-w-full max-h-full rounded-2xl"
              style={{
                objectFit: "contain",
                boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 pb-6 pt-12 z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
      >
        {/* Author info */}
        <div className="flex items-center gap-2.5">
          {current.author && (
            <>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "#1a1512",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                {current.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>{current.author}</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
                  {current.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Slideshow controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "white" }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ background: "#1a1512", color: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
          >
            {playing ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
          </button>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "white" }}
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Music bar */}
        <MusicBar {...music} theme="dark" />
      </div>

      {/* Thumbnail strip */}
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-2xl z-10"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", maxWidth: "min(90vw, 400px)", overflowX: "auto" }}
      >
        {visible.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goTo(i, i > index ? 1 : -1)}
            className="shrink-0 rounded-lg overflow-hidden transition-all"
            style={{
              width: i === index ? "36px" : "28px",
              height: "28px",
              opacity: i === index ? 1 : 0.5,
              border: i === index ? "2px solid #1a1512" : "1.5px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
