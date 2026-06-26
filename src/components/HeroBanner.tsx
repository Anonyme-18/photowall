import { motion } from "motion/react";
const configLogo = "/imports/image.png";

export function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-3xl mb-6 mt-4 flex items-center justify-between px-8 py-6"
      style={{
        background: "#eee9e3",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        minHeight: "140px",
      }}
    >
      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Left: Wordmark */}
      <div className="relative z-10 flex flex-col gap-0.5">
        <span
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: "clamp(2.2rem, 6vw, 3.2rem)",
            letterSpacing: "0.06em",
            color: "#1a1512",
            lineHeight: 0.9,
            textShadow: "2px 2px 0px rgba(0,0,0,0.06)",
          }}
        >
          CONFIG
        </span>
        <span
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
            color: "#7a6f65",
            lineHeight: 1,
            marginLeft: "2px",
          }}
        >
          Photo wall
        </span>
      </div>

      {/* Right: Polaroid camera from imported image */}
      <motion.div
        className="relative z-10 shrink-0"
        initial={{ rotate: 3, scale: 0.92 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ width: "clamp(100px, 28vw, 180px)" }}
      >
        <img
          src={configLogo}
          alt="CONFIG Photo wall — appareil photo Polaroid"
          className="w-full"
          style={{ objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))" }}
        />
      </motion.div>
    </motion.div>
  );
}
