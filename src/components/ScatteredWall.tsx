import { AnimatePresence } from "motion/react";
import { PolaroidCard } from "./PolaroidCard";
import type { Photo } from "./types";

interface ScatteredWallProps {
  photos: Photo[];
  showHidden: boolean;
  onToggleHide: (id: string) => void;
  eventName?: string;
}

function deterministicRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return ((Math.abs(hash) % 15) - 7);
}

function PolaroidCameraIllustration() {
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Camera body */}
      <rect x="16" y="28" width="188" height="122" rx="14" fill="white" />
      <rect x="16" y="28" width="188" height="122" rx="14" stroke="#e8e2da" strokeWidth="1.5" />

      {/* Dark top section */}
      <path d="M16 28 h188 a14 14 0 0 1 14 14 v28 h-216 v-28 a14 14 0 0 1 14-14z" fill="#1a1512" />

      {/* Rainbow stripe */}
      <rect x="16" y="70" width="188" height="6" fill="none" />
      <rect x="16"  y="70" width="32" height="6" fill="#e84040" />
      <rect x="48"  y="70" width="32" height="6" fill="#ff8c00" />
      <rect x="80"  y="70" width="32" height="6" fill="#f5c842" />
      <rect x="112" y="70" width="32" height="6" fill="#27c93f" />
      <rect x="144" y="70" width="30" height="6" fill="#2196f3" />
      <rect x="174" y="70" width="30" height="6" fill="#9c27b0" />

      {/* Lens outer ring */}
      <circle cx="90" cy="50" r="20" fill="#2a2520" />
      {/* Lens inner */}
      <circle cx="90" cy="50" r="15" fill="#1a1512" />
      {/* Lens glass */}
      <circle cx="90" cy="50" r="10" fill="#1e3a5f" />
      {/* Lens highlight */}
      <ellipse cx="85" cy="45" rx="4" ry="3" fill="rgba(255,255,255,0.22)" transform="rotate(-20 85 45)" />

      {/* Viewfinder */}
      <rect x="128" y="38" width="22" height="14" rx="3" fill="#2a2520" />
      <rect x="130" y="40" width="18" height="10" rx="2" fill="#1e3a5f" />

      {/* Flash */}
      <rect x="32" y="36" width="28" height="18" rx="5" fill="#e8e0d0" />
      <rect x="34" y="38" width="24" height="14" rx="3" fill="#f5f2ec" />

      {/* Red indicator */}
      <circle cx="165" cy="44" r="5" fill="#e84040" />
      <circle cx="165" cy="44" r="3" fill="#ff6b6b" />

      {/* White body area */}
      <rect x="16" y="76" width="188" height="74" fill="white" />

      {/* Shot counter text */}
      <text x="172" y="104" fontSize="8" fill="#a09890" fontFamily="monospace" textAnchor="middle">24</text>
      <rect x="158" y="96" width="28" height="12" rx="3" fill="rgba(0,0,0,0.04)" />

      {/* Eject slot */}
      <rect x="52" y="141" width="116" height="6" rx="3" fill="#2a2520" />

      {/* Photo ejecting */}
      <rect x="68" y="141" width="84" height="32" rx="2" fill="white" stroke="#e8e2da" strokeWidth="1" />
      {/* Photo content simulation */}
      <rect x="72" y="145" width="76" height="22" rx="1" fill="#f0ebe4" />
      <circle cx="110" cy="156" r="6" fill="#d4c8bc" opacity="0.6" />

      {/* Shadow under camera */}
      <ellipse cx="110" cy="174" rx="72" ry="5" fill="rgba(0,0,0,0.06)" />
    </svg>
  );
}

export function ScatteredWall({ photos, showHidden, onToggleHide, eventName }: ScatteredWallProps) {
  const visible = showHidden ? photos : photos.filter((p) => !p.hidden);

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <PolaroidCameraIllustration />
        <div className="text-center space-y-1">
          <p style={{ fontWeight: 700, color: "#1a1512", fontSize: "1.1rem" }}>
            Le mur est vide pour l'instant
          </p>
          <p style={{ color: "#a09890", fontSize: "0.85rem" }}>
            Soyez le premier à immortaliser l'événement !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap justify-center"
      style={{ gap: "clamp(10px, 2.5vw, 24px)", padding: "20px 8px 8px" }}
    >
      <AnimatePresence>
        {visible.map((photo) => (
          <PolaroidCard
            key={photo.id}
            photo={photo}
            rotation={deterministicRotation(photo.id)}
            onToggleHide={onToggleHide}
            isAdmin={true}
            eventName={eventName}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
