import { Calendar, MapPin, Users, Clock, Share2, QrCode } from "lucide-react";
import { motion } from "motion/react";
import type { EventConfig } from "@/lib/types/event";

interface EventInfoTabProps {
  eventName: string;
  eventConfig: EventConfig;
  onSaveField: (field: keyof EventConfig, value: string) => void;
}

export function EventInfoTab({ eventName, eventConfig, onSaveField }: EventInfoTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto py-8 px-4 space-y-6"
    >
      {/* Hero card */}
      <div
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: "#1a1512",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
          style={{ background: "white" }}
        />
        <div
          className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full opacity-15"
          style={{ background: "white" }}
        />

        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
          >
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 600 }}>En direct</span>
          </div>
          <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 800, lineHeight: 1.2 }}>
            {eventName}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "8px", fontSize: "0.9rem" }}>
            Mur de photos collaboratif · Partagez vos moments
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Calendar, label: "Date",         field: "eventDate"         as const },
          { icon: Clock,    label: "Horaires",      field: "eventTime"         as const },
          { icon: MapPin,   label: "Lieu",          field: "eventLocation"     as const },
          { icon: Users,    label: "Participants",  field: "eventParticipants" as const },
        ].map(({ icon: Icon, label, field }) => (
          <div
            key={label}
            className="group flex items-start gap-3 p-4 rounded-2xl transition-all"
            style={{ background: "#f8f8fb", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,0,0,0.06)" }}
            >
              <Icon size={16} style={{ color: "#1a1512" }} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "0.7rem", color: "#717182", fontWeight: 500 }}>{label}</p>
              <p
                contentEditable
                suppressContentEditableWarning
                style={{ fontSize: "0.85rem", color: "#0f0f1a", fontWeight: 600, marginTop: "1px", outline: "none", borderRadius: "4px", padding: "1px 4px", margin: "1px -4px" }}
                onFocus={(e) => { e.currentTarget.style.background = "rgba(245,200,66,0.15)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(245,200,66,0.5)"; }}
                onBlur={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                  const newVal = e.currentTarget.textContent?.trim() ?? "";
                  if (newVal) onSaveField(field, newVal);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
                title="Cliquer pour modifier"
              >
                {eventConfig[field]}
              </p>
            </div>
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
              style={{ fontSize: "0.62rem", color: "#b0b0b0" }}
              title="Champ éditable"
            >
              ✎
            </span>
          </div>
        ))}
      </div>

      {/* How to share */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "rgba(0,0,0,0.03)", border: "1.5px solid rgba(0,0,0,0.07)" }}
      >
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f0f1a" }}>
          Comment participer ?
        </h3>
        <ol className="space-y-2.5">
          {[
            "Ouvrez cette page sur votre téléphone",
            "Appuyez sur « Ajouter une photo »",
            "Prenez une photo ou choisissez-en une depuis votre galerie",
            "Optionnellement, ajoutez votre prénom",
            "Publiez — votre photo apparaît instantanément sur le mur !",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: "#1a1512",
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: "0.83rem", color: "#374151", lineHeight: 1.5 }}>{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Share row */}
      <div className="flex gap-3">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:opacity-90 active:scale-98"
          style={{
            background: "#1a1512",
            color: "white",
            fontWeight: 600,
            fontSize: "0.85rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: `${eventName} – Photo Wall`, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Share2 size={15} strokeWidth={2.5} />
          Partager le lien
        </button>
        <button
          className="w-12 flex items-center justify-center rounded-xl transition-all hover:opacity-90 active:scale-95 relative group"
          style={{
            background: "#1a1512",
            color: "white",
            border: "1.5px solid transparent",
          }}
          title="Afficher le QR Code"
          onClick={() => {
            const url = encodeURIComponent(window.location.href);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&color=1a1512&bgcolor=f0ebe4&data=${url}`;
            const win = window.open("", "_blank", "width=380,height=440,resizable=no");
            if (win) {
              win.document.write(`
                <html>
                  <head>
                    <title>QR Code — ${eventName}</title>
                    <style>
                      body { margin:0; display:flex; flex-direction:column; align-items:center;
                             justify-content:center; min-height:100vh; background:#f0ebe4;
                             font-family:system-ui,sans-serif; gap:16px; }
                      img  { border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
                      p    { font-size:13px; color:#7a6f65; margin:0; }
                      strong { font-size:18px; color:#1a1512; letter-spacing:0.04em; }
                    </style>
                  </head>
                  <body>
                    <strong>${eventName} · Photo wall</strong>
                    <img src="${qrUrl}" width="260" height="260" alt="QR Code" />
                    <p>Scannez pour rejoindre le mur de photos</p>
                  </body>
                </html>`);
              win.document.close();
            }
          }}
        >
          <QrCode size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Footer note */}
      <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#b0b0c0" }}>
        Propulsé par OmertA · 2026
      </p>
    </motion.div>
  );
}
