import { Images, Eye, EyeOff, Users, TrendingUp, Clock } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { LazyImage } from "../LazyImage";
interface Props { onNavigate: (s: "overview" | "photos" | "event" | "settings") => void; }

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  return `Il y a ${Math.floor(diff / 3600)} h`;
}

export function DashboardOverview({ onNavigate }: Props) {
  const { photos, eventConfig } = useAppContext();

  const total   = photos.length;
  const visible = photos.filter((p) => !p.hidden).length;
  const hidden  = photos.filter((p) => p.hidden).length;
  const authors = new Set(photos.filter((p) => p.author).map((p) => p.author)).size;
  const recent  = [...photos].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

  // Simple activity by hour (last 24h bucketed in 6 slots of 4h)
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const from = Date.now() - (6 - i) * 4 * 3600 * 1000;
    const to   = from + 4 * 3600 * 1000;
    return { label: `H-${(6 - i) * 4}`, count: photos.filter((p) => p.timestamp.getTime() > from && p.timestamp.getTime() <= to).length };
  });
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  const stats = [
    { icon: Images,   label: "Total photos",   value: total,   color: "#f5c842", bg: "rgba(245,200,66,0.12)",  onClick: () => onNavigate("photos") },
    { icon: Eye,      label: "Visibles",        value: visible, color: "#22c55e", bg: "rgba(34,197,94,0.1)",    onClick: () => onNavigate("photos") },
    { icon: EyeOff,   label: "Masquées",        value: hidden,  color: "#ef4444", bg: "rgba(239,68,68,0.1)",    onClick: () => onNavigate("photos") },
    { icon: Users,    label: "Participants",    value: authors, color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   onClick: () => onNavigate("event") },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1a1512" }}>Vue d'ensemble</h1>
        <p style={{ fontSize: "0.82rem", color: "#7a6f65", marginTop: "2px" }}>
          Événement : <strong style={{ color: "#1a1512" }}>{eventConfig.name}</strong>
          <span
            className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full"
            style={{ background: "rgba(239,68,68,0.1)", fontSize: "0.7rem", fontWeight: 700, color: "#dc2626" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            Live
          </span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color, bg, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col gap-3 p-4 rounded-2xl text-left transition-all hover:scale-105 active:scale-100"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={16} style={{ color }} strokeWidth={2} />
              </div>
              <TrendingUp size={13} style={{ color: "#b0b0b0" }} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a1512", lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: "0.72rem", color: "#7a6f65", marginTop: "3px", fontWeight: 500 }}>{label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Activity chart */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} style={{ color: "#7a6f65" }} strokeWidth={2} />
            <h2 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1512" }}>Activité (dernières 24h)</h2>
          </div>
          <div className="flex items-end gap-2 h-24">
            {buckets.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(4, (b.count / maxBucket) * 80)}px`,
                    background: b.count > 0 ? "linear-gradient(to top, #f5c842, #f5c842cc)" : "rgba(0,0,0,0.07)",
                  }}
                />
                <span style={{ fontSize: "0.58rem", color: "#b0b0b0" }}>{b.label}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent photos */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={15} style={{ color: "#7a6f65" }} strokeWidth={2} />
              <h2 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1512" }}>Photos récentes</h2>
            </div>
            <button
              onClick={() => onNavigate("photos")}
              style={{ fontSize: "0.72rem", color: "#7a6f65", fontWeight: 500 }}
              className="hover:underline"
            >
              Tout voir
            </button>
          </div>
          <div className="space-y-2.5">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <LazyImage
                  src={p.url}
                  alt=""
                  style={{ width: "36px", height: "36px", borderRadius: "8px", opacity: p.hidden ? 0.4 : 1, flexShrink: 0, aspectRatio: undefined }}
                />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a1512" }}>
                    {p.author || <span style={{ color: "#b0b0b0", fontStyle: "italic" }}>Anonyme</span>}
                  </p>
                  <p style={{ fontSize: "0.68rem", color: "#b0b0b0" }}>{timeAgo(p.timestamp)}</p>
                </div>
                {p.hidden && (
                  <span
                    className="px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "0.62rem", fontWeight: 700 }}
                  >
                    Masqué
                  </span>
                )}
              </div>
            ))}
            {recent.length === 0 && (
              <p style={{ color: "#b0b0b0", fontSize: "0.8rem", textAlign: "center", padding: "16px 0" }}>
                Aucune photo encore
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
