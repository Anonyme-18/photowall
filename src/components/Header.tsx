import { Maximize2, Camera } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
}

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSlideshowToggle: () => void;
  photoCount: number;
  eventName: string;
  eventSubtitle: string;
  tabs: TabItem[];
}

export function Header({
  activeTab,
  onTabChange,
  onSlideshowToggle,
  photoCount,
  eventName,
  tabs,
}: HeaderProps) {
  return (
    <header
      style={{
        background: "rgba(240,235,228,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* ── Left: branding ─────────────────────────────────── */}
          <a
            href="#/"
            title="Accueil"
            className="flex items-center gap-2.5 shrink-0 group"
            style={{ textDecoration: "none" }}
          >
            {/* Icon badge */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-transform group-hover:scale-105"
              style={{ background: "#1a1512" }}
            >
              <Camera size={18} color="white" strokeWidth={2} />
            </div>

            {/* Text stack */}
            <div className="flex flex-col leading-none gap-0.5">
              {/* Org name */}
              <span
                style={{
                  fontFamily: "'Bangers', cursive",
                  fontSize: "1.05rem",
                  letterSpacing: "0.08em",
                  color: "#1a1512",
                  lineHeight: 1,
                }}
              >
                Les Pro de la Tech
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "#7a6f65",
                    marginLeft: "5px",
                    verticalAlign: "middle",
                    textTransform: "uppercase",
                  }}
                >
                  Photowall
                </span>
              </span>
              {/* Event name */}
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "0.8rem",
                  color: "#b97c2a",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ✦ {eventName}
              </span>
            </div>
          </a>

          {/* ── Center: tab selector ───────────────────────────── */}
          <nav
            className="flex items-center rounded-xl p-0.5"
            style={{ background: "rgba(26,21,18,0.07)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-3.5 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  fontSize: "0.8rem",
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  color: activeTab === tab.id ? "#1a1512" : "#7a6f65",
                  background: activeTab === tab.id ? "white" : "transparent",
                  boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ── Right: Live + count + projection ──────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#dc2626" }}>
                Live
              </span>
            </div>

            {/* Memories count */}
            <span
              className="hidden sm:block"
              style={{ fontSize: "0.75rem", fontWeight: 500, color: "#7a6f65" }}
            >
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>

            {/* Projection button */}
            <button
              onClick={onSlideshowToggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "#1a1512",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
              title="Mode projection"
            >
              <Maximize2 size={12} strokeWidth={2.5} />
              <span className="hidden sm:inline">Projection</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
