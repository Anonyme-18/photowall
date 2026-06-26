import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";

const PDF_URL = "/programme.pdf";
const PREVIEW_SCALE = 0.5;

export function MeetupTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1512" }}>Programme</h2>
        <a
          href={PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
          style={{
            background: "rgba(26,21,18,0.06)",
            color: "#3d3530",
            fontSize: "0.78rem",
            fontWeight: 600,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <ExternalLink size={14} strokeWidth={2} />
          Ouvrir
        </a>
      </div>

      <div
        className="flex-1 min-h-0 rounded-2xl overflow-auto"
        style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <iframe
          src={PDF_URL}
          title="Programme du meetup"
          style={{
            border: "none",
            background: "#faf7f4",
            width: `${100 / PREVIEW_SCALE}%`,
            minHeight: `calc((100dvh - 220px) / ${PREVIEW_SCALE})`,
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </motion.div>
  );
}
