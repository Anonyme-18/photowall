import { useState } from "react";
import { SkipBack, SkipForward, Volume2, VolumeX, Music, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { useMusicPlayer } from "./useMusicPlayer";

type MusicBarProps = ReturnType<typeof useMusicPlayer> & {
  theme?: "dark" | "light";
};

export function MusicBar({
  currentTrack,
  trackIndex,
  playing,
  volume,
  setPlaying,
  setVolume,
  nextTrack,
  prevTrack,
  selectTrack,
  library,
  theme = "dark",
}: MusicBarProps) {
  const [showLibrary, setShowLibrary] = useState(false);

  const isDark = theme === "dark";
  const bg      = isDark ? "rgba(0,0,0,0.55)"  : "rgba(255,255,255,0.9)";
  const border  = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const text    = isDark ? "white"              : "#1a1512";
  const subtext = isDark ? "rgba(255,255,255,0.5)" : "#7a6f65";
  const hover   = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return (
    <div style={{ position: "relative" }}>
      {/* Library panel */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full mb-2 left-0 right-0 rounded-2xl overflow-hidden"
            style={{
              background: isDark ? "rgba(20,16,14,0.92)" : "white",
              backdropFilter: "blur(12px)",
              border: `1px solid ${border}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
          >
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${border}` }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: subtext, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Bibliothèque musicale
              </p>
            </div>
            {library.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => { selectTrack(idx); setShowLibrary(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left"
                style={{ background: idx === trackIndex ? hover : "transparent" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: idx === trackIndex ? "#f5c842" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
                  }}
                >
                  {idx === trackIndex && playing ? (
                    <span className="flex items-end gap-px" style={{ height: "12px" }}>
                      {[0.5, 1, 0.7].map((h, i) => (
                        <span key={i} className="rounded-sm"
                          style={{
                            width: "2px", height: `${h * 100}%`,
                            background: "#1a1512",
                            animation: `soundbar 0.7s ease-in-out ${i * 0.15}s infinite alternate`,
                          }}
                        />
                      ))}
                    </span>
                  ) : (
                    <Music size={13} style={{ color: idx === trackIndex ? "#1a1512" : subtext }} strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "0.8rem", fontWeight: idx === trackIndex ? 700 : 500, color: text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {track.title}
                  </p>
                  <p style={{ fontSize: "0.67rem", color: subtext, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {track.artist}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-2xl"
        style={{ background: bg, backdropFilter: "blur(12px)", border: `1px solid ${border}`, minWidth: "260px" }}
      >
        {/* Library toggle */}
        <button
          onClick={() => setShowLibrary((v) => !v)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all hover:opacity-80"
          style={{ background: showLibrary ? "#f5c842" : hover, color: showLibrary ? "#1a1512" : text }}
          title="Bibliothèque"
        >
          <Music size={13} strokeWidth={2.2} />
          {showLibrary ? <ChevronDown size={11} strokeWidth={2.5} /> : <ChevronUp size={11} strokeWidth={2.5} />}
        </button>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentTrack.title}
          </p>
          <p style={{ fontSize: "0.62rem", color: subtext, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentTrack.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={prevTrack} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ color: text }}>
            <SkipBack size={13} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setPlaying(!playing)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
            style={{ color: text }}
          >
            {playing ? (
              <span className="flex items-end gap-px" style={{ height: "14px" }}>
                {[0.45, 1, 0.65, 0.85].map((h, i) => (
                  <span key={i} className="rounded-sm"
                    style={{
                      width: "2.5px", height: `${h * 100}%`,
                      background: isDark ? "white" : "#1a1512",
                      animation: `soundbar 0.75s ease-in-out ${i * 0.13}s infinite alternate`,
                    }}
                  />
                ))}
              </span>
            ) : (
              <VolumeX size={14} strokeWidth={2.2} />
            )}
          </button>

          <button onClick={nextTrack} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ color: text }}>
            <SkipForward size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-1">
          <Volume2 size={11} style={{ color: subtext }} strokeWidth={2} />
          <input
            type="range" min={0} max={1} step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-14 accent-yellow-400"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes soundbar {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
