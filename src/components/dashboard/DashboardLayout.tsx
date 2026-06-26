import { useState } from "react";
import { LayoutDashboard, Images, Settings, Calendar, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardPhotos } from "./DashboardPhotos";
import { DashboardEventEditor } from "./DashboardEventEditor";
const configLogo = "/imports/image.png";

type Section = "overview" | "photos" | "event" | "settings";

const NAV = [
  { id: "overview" as Section, icon: LayoutDashboard, label: "Vue d'ensemble" },
  { id: "photos"   as Section, icon: Images,          label: "Photos" },
  { id: "event"    as Section, icon: Calendar,         label: "Événement" },
  { id: "settings" as Section, icon: Settings,         label: "Paramètres" },
];

export function DashboardLayout({ onGoToWall }: { onGoToWall: () => void }) {
  const [active, setActive] = useState<Section>("overview");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0ebe4" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? "64px" : "220px",
          background: "#1a1512",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-4 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)", minHeight: "64px" }}
        >
          <img src={configLogo} alt="CONFIG" style={{ height: "30px", width: "auto", objectFit: "contain", flexShrink: 0 }} />
          {!collapsed && (
            <div className="flex flex-col leading-none overflow-hidden">
              <span style={{ fontFamily: "'Bangers', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: "white", lineHeight: 1 }}>
                CONFIG
              </span>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>
                Dashboard
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActive(id as Section)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: active === id ? "rgba(245,200,66,0.15)" : "transparent",
                color: active === id ? "#f5c842" : "rgba(255,255,255,0.5)",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} strokeWidth={active === id ? 2.5 : 1.8} />
              {!collapsed && (
                <span style={{ fontSize: "0.82rem", fontWeight: active === id ? 600 : 400 }}>
                  {label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-2 pb-4 space-y-1">
          <button
            onClick={onGoToWall}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
            style={{
              background: "rgba(245,200,66,0.12)",
              color: "#f5c842",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            title={collapsed ? "Voir le mur" : undefined}
          >
            <ExternalLink size={16} strokeWidth={2} />
            {!collapsed && <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Voir le mur</span>}
          </button>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full flex items-center justify-center py-2 rounded-xl transition-all hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.25)" }}
            title={collapsed ? "Agrandir" : "Réduire"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {active === "overview" && <DashboardOverview onNavigate={setActive} />}
        {active === "photos"   && <DashboardPhotos />}
        {active === "event"    && <DashboardEventEditor />}
        {active === "settings" && <SettingsPlaceholder />}
      </main>
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
      <Settings size={40} strokeWidth={1.2} style={{ color: "#7a6f65" }} />
      <p style={{ color: "#7a6f65", fontSize: "0.9rem" }}>Paramètres avancés — bientôt disponible</p>
    </div>
  );
}
