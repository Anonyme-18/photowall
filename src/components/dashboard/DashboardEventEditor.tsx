import { useState } from "react";
import { Plus, Trash2, Check, RefreshCw, Palette, Calendar, Clock, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "@/context/AppContext";
import type { EventConfig } from "@/lib/types/event";

const ACCENT_COLORS = [
  { label: "Jaune", value: "#f5c842" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Bleu", value: "#2563eb" },
  { label: "Vert", value: "#16a34a" },
  { label: "Rouge", value: "#dc2626" },
  { label: "Rose", value: "#db2777" },
  { label: "Orange", value: "#ea580c" },
  { label: "Gris", value: "#475569" },
];

export function DashboardEventEditor() {
  const { eventConfig, setEventConfig } = useAppContext();
  const [draft, setDraft] = useState<EventConfig>({ ...eventConfig, tabs: [...eventConfig.tabs] });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await setEventConfig(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* l'état local reste en draft */
    }
  };

  const handleReset = () => {
    setDraft({ ...eventConfig, tabs: [...eventConfig.tabs] });
  };

  const addTab = () => {
    setDraft((d) => ({ ...d, tabs: [...d.tabs, { id: `tab-${Date.now()}`, label: "Nouvel onglet" }] }));
  };

  const updateTab = (idx: number, label: string) => {
    setDraft((d) => ({ ...d, tabs: d.tabs.map((t, i) => i === idx ? { ...t, label } : t) }));
  };

  const removeTab = (idx: number) => {
    if (draft.tabs.length <= 1) return;
    setDraft((d) => ({ ...d, tabs: d.tabs.filter((_, i) => i !== idx) }));
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(eventConfig);

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1a1512" }}>Configuration de l'événement</h1>
        <p style={{ fontSize: "0.82rem", color: "#7a6f65", marginTop: "2px" }}>
          Personnalisez l'en-tête et les onglets du mur de photos.
        </p>
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl p-5 space-y-5"
        style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
      >
        {/* Name */}
        <div className="space-y-1.5">
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a1512" }}>
            Nom de l'événement
          </label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            maxLength={30}
            className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all"
            style={{
              background: "#f5f3f0",
              border: "1.5px solid transparent",
              fontSize: "0.9rem",
              color: "#1a1512",
              fontFamily: "'Bangers', cursive",
              letterSpacing: "0.05em",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#f5c842"; e.currentTarget.style.background = "white"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f5f3f0"; }}
            placeholder="ex : OmertA"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-1.5">
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a1512" }}>
            Sous-titre
          </label>
          <input
            type="text"
            value={draft.subtitle}
            onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
            maxLength={30}
            className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all"
            style={{
              background: "#f5f3f0",
              border: "1.5px solid transparent",
              fontSize: "0.9rem",
              color: "#1a1512",
              fontFamily: "'Caveat', cursive",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#f5c842"; e.currentTarget.style.background = "white"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f5f3f0"; }}
            placeholder="ex : Photo wall"
          />
        </div>

        {/* Accent color */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a1512" }}>
            <Palette size={13} strokeWidth={2} />
            Couleur accent (bouton CTA)
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDraft((d) => ({ ...d, accentColor: value }))}
                className="w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                style={{
                  background: value,
                  boxShadow: draft.accentColor === value ? `0 0 0 3px white, 0 0 0 5px ${value}` : "0 2px 6px rgba(0,0,0,0.15)",
                }}
                title={label}
              >
                {draft.accentColor === value && <Check size={14} strokeWidth={3} style={{ color: value === "#f5c842" ? "#1a1512" : "white" }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />

        {/* Event details */}
        <div className="space-y-3">
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a1512", display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={13} strokeWidth={2} /> Détails de l'événement
          </label>
          {([
            { icon: Calendar, key: "eventDate",         placeholder: "ex : 25 juin 2026",  label: "Date" },
            { icon: Clock,    key: "eventTime",         placeholder: "ex : 19h – 23h",     label: "Horaires" },
            { icon: MapPin,   key: "eventLocation",     placeholder: "ex : Dakar, Sénégal", label: "Lieu" },
            { icon: Users,    key: "eventParticipants", placeholder: "ex : 120 personnes",  label: "Participants" },
          ] as { icon: typeof Calendar; key: keyof typeof draft; placeholder: string; label: string }[]).map(({ icon: Icon, key, placeholder, label }) => (
            <div key={String(key)} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.05)" }}>
                <Icon size={14} style={{ color: "#7a6f65" }} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: "0.65rem", color: "#b0b0b0", fontWeight: 500, marginBottom: "2px" }}>{label}</p>
                <input
                  type="text"
                  value={String(draft[key] ?? "")}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  placeholder={placeholder}
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-xl outline-none transition-all"
                  style={{ background: "#f5f3f0", border: "1.5px solid transparent", fontSize: "0.85rem", color: "#1a1512" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f5c842"; e.currentTarget.style.background = "white"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f5f3f0"; }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />

        {/* Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a1512" }}>Onglets de navigation</label>
            <button
              onClick={addTab}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{ background: "rgba(245,200,66,0.15)", color: "#1a1512", fontSize: "0.75rem", fontWeight: 600 }}
            >
              <Plus size={12} strokeWidth={2.5} />
              Ajouter
            </button>
          </div>

          <div className="space-y-2">
            {draft.tabs.map((tab, idx) => (
              <div key={tab.id} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,0,0,0.05)", fontSize: "0.65rem", fontWeight: 700, color: "#7a6f65" }}
                >
                  {idx + 1}
                </div>
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) => updateTab(idx, e.target.value)}
                  maxLength={24}
                  className="flex-1 px-3 py-2 rounded-xl outline-none transition-all"
                  style={{
                    background: "#f5f3f0",
                    border: "1.5px solid transparent",
                    fontSize: "0.85rem",
                    color: "#1a1512",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f5c842"; e.currentTarget.style.background = "white"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f5f3f0"; }}
                />
                <button
                  onClick={() => removeTab(idx)}
                  disabled={draft.tabs.length <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 disabled:opacity-30"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "rgba(0,0,0,0.04)", border: "1px dashed rgba(0,0,0,0.12)" }}
      >
        <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#7a6f65", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Aperçu
        </p>
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ background: "rgba(240,235,228,0.9)", border: "1px solid rgba(0,0,0,0.07)" }}
        >
          <div className="flex flex-col leading-none">
            <span style={{ fontFamily: "'Bangers', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: "#1a1512" }}>
              {draft.name || "Événement"}
            </span>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.65rem", color: "#7a6f65" }}>
              {draft.subtitle || "Sous-titre"}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-black/[0.06] rounded-lg p-0.5">
            {draft.tabs.slice(0, 3).map((t, i) => (
              <span
                key={t.id}
                className="px-2.5 py-1 rounded-md"
                style={{
                  fontSize: "0.72rem",
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? "#1a1512" : "#7a6f65",
                  background: i === 0 ? "white" : "transparent",
                  boxShadow: i === 0 ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
          <div
            className="px-3 py-1.5 rounded-lg"
            style={{ background: draft.accentColor, fontSize: "0.72rem", fontWeight: 700, color: draft.accentColor === "#f5c842" ? "#1a1512" : "white" }}
          >
            + Add a photo
          </div>
        </div>
      </div>

      {/* Save / reset */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          disabled={!isDirty}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-30"
          style={{ border: "1.5px solid rgba(0,0,0,0.12)", color: "#7a6f65", fontSize: "0.85rem", fontWeight: 600, background: "white" }}
        >
          <RefreshCw size={14} strokeWidth={2} />
          Réinitialiser
        </button>

        <motion.button
          onClick={handleSave}
          disabled={!isDirty && !saved}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all disabled:opacity-40"
          style={{
            background: saved ? "#16a34a" : "#1a1512",
            color: "white",
            fontSize: "0.88rem",
            fontWeight: 700,
            boxShadow: isDirty ? "0 4px 16px rgba(26,21,18,0.25)" : "none",
          }}
        >
          {saved ? (
            <><Check size={16} strokeWidth={2.5} /> Enregistré !</>
          ) : (
            <>Appliquer les modifications</>
          )}
        </motion.button>
      </div>
    </div>
  );
}
