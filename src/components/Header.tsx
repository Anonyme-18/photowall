import { useEffect, useRef } from "react";
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

function TabNav({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}) {
  return (
    <nav
      className={`flex items-center rounded-xl p-0.5 ${className}`}
      style={{ background: "rgba(26,21,18,0.07)" }}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative flex-1 md:flex-none px-2 sm:px-3.5 py-1.5 rounded-lg transition-all duration-200 min-w-0"
          style={{
            fontSize: "clamp(0.68rem, 2.8vw, 0.8rem)",
            fontWeight: activeTab === tab.id ? 700 : 400,
            color: activeTab === tab.id ? "#1a1512" : "#7a6f65",
            background: activeTab === tab.id ? "white" : "transparent",
            boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function HeaderActions({
  photoCount,
  onSlideshowToggle,
  compact = false,
}: {
  photoCount: number;
  onSlideshowToggle: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#dc2626" }}>Live</span>
      </div>

      {!compact && (
        <span
          className="hidden lg:block"
          style={{ fontSize: "0.75rem", fontWeight: 500, color: "#7a6f65", whiteSpace: "nowrap" }}
        >
          {photoCount} {photoCount === 1 ? "photo" : "photos"}
        </span>
      )}

      <button
        type="button"
        onClick={onSlideshowToggle}
        className="flex items-center justify-center gap-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95 shrink-0"
        style={{
          background: "#1a1512",
          color: "white",
          fontSize: "0.72rem",
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          padding: compact ? "0.45rem 0.55rem" : "0.45rem 0.65rem",
          minWidth: compact ? 36 : undefined,
        }}
        title="Mode projection"
        aria-label="Mode projection"
      >
        <Maximize2 size={13} strokeWidth={2.5} />
        <span className="hidden sm:inline">Projection</span>
      </button>
    </div>
  );
}

export function Header({
  activeTab,
  onTabChange,
  onSlideshowToggle,
  photoCount,
  eventName,
  tabs,
}: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty("--app-header-h", `${el.offsetHeight}px`);
    };

    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      style={{
        background: "rgba(240,235,228,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Mobile / tablette : 2 lignes */}
        <div className="flex flex-col gap-2 py-2 md:hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <a
              href="#/"
              title="Accueil"
              className="flex items-center gap-2 min-w-0 flex-1"
              style={{ textDecoration: "none" }}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                style={{ background: "#1a1512" }}
              >
                <Camera size={16} color="white" strokeWidth={2} />
              </div>
              <div className="flex flex-col leading-none gap-0.5 min-w-0">
                <span
                  className="truncate"
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "0.9rem",
                    letterSpacing: "0.06em",
                    color: "#1a1512",
                    lineHeight: 1.1,
                  }}
                >
                  Les Pro de la Tech
                </span>
                <span
                  className="truncate"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "0.72rem",
                    color: "#b97c2a",
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  ✦ {eventName}
                </span>
              </div>
            </a>
            <HeaderActions photoCount={photoCount} onSlideshowToggle={onSlideshowToggle} compact />
          </div>
          <TabNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} className="w-full" />
        </div>

        {/* Desktop : 1 ligne */}
        <div className="hidden md:flex items-center justify-between h-16 gap-3 min-w-0">
          <a
            href="#/"
            title="Accueil"
            className="flex items-center gap-2.5 shrink-0 min-w-0 max-w-[38%] group"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-transform group-hover:scale-105"
              style={{ background: "#1a1512" }}
            >
              <Camera size={18} color="white" strokeWidth={2} />
            </div>
            <div className="flex flex-col leading-none gap-0.5 min-w-0">
              <span
                className="truncate"
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
                  className="hidden lg:inline"
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
              <span
                className="truncate"
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

          <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            className="shrink-0"
          />

          <HeaderActions photoCount={photoCount} onSlideshowToggle={onSlideshowToggle} />
        </div>
      </div>
    </header>
  );
}
