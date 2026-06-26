import { useRef, useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import type { Photo } from "./types";
import { isUserPhoto } from "./types";
import { PolaroidCard } from "./PolaroidCard";

const CARD_W = 160;
const CARD_H = 205;
const CULL_MARGIN = 120;

function isPhotoInViewport(
  photo: Photo,
  offset: { x: number; y: number },
  zoom: number,
  viewW: number,
  viewH: number,
): boolean {
  const px = photo.x ?? 0;
  const py = photo.y ?? 0;
  const left = offset.x + px * zoom;
  const top = offset.y + py * zoom;
  const w = CARD_W * zoom;
  const h = CARD_H * zoom;
  return (
    left + w > -CULL_MARGIN &&
    left < viewW + CULL_MARGIN &&
    top + h > -CULL_MARGIN &&
    top < viewH + CULL_MARGIN
  );
}

interface InfiniteCanvasProps {
  photos: Photo[];
  onToggleHide: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateRotation: (id: string, rotation: number) => void;
  onDeletePhoto: (id: string) => void;
  eventName?: string;
  zoom: number;
  offset: { x: number; y: number };
  onZoomChange: (z: number) => void;
  onOffsetChange: (o: { x: number; y: number }) => void;
}

function PolaroidCameraIllustration() {
  return (
    <svg width="200" height="164" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="16" y="28" width="188" height="122" rx="14" fill="white" />
      <rect x="16" y="28" width="188" height="122" rx="14" stroke="#e8e2da" strokeWidth="1.5" />
      <path d="M16 28 h188 a14 14 0 0 1 14 14 v28 h-216 v-28 a14 14 0 0 1 14-14z" fill="#1a1512" />
      <rect x="16"  y="70" width="32" height="6" fill="#e84040" />
      <rect x="48"  y="70" width="32" height="6" fill="#ff8c00" />
      <rect x="80"  y="70" width="32" height="6" fill="#f5c842" />
      <rect x="112" y="70" width="32" height="6" fill="#27c93f" />
      <rect x="144" y="70" width="30" height="6" fill="#2196f3" />
      <rect x="174" y="70" width="30" height="6" fill="#9c27b0" />
      <circle cx="90" cy="50" r="20" fill="#2a2520" />
      <circle cx="90" cy="50" r="15" fill="#1a1512" />
      <circle cx="90" cy="50" r="10" fill="#1e3a5f" />
      <ellipse cx="85" cy="45" rx="4" ry="3" fill="rgba(255,255,255,0.22)" transform="rotate(-20 85 45)" />
      <rect x="128" y="38" width="22" height="14" rx="3" fill="#2a2520" />
      <rect x="130" y="40" width="18" height="10" rx="2" fill="#1e3a5f" />
      <rect x="32" y="36" width="28" height="18" rx="5" fill="#e8e0d0" />
      <rect x="34" y="38" width="24" height="14" rx="3" fill="#f5f2ec" />
      <circle cx="165" cy="44" r="5" fill="#e84040" />
      <circle cx="165" cy="44" r="3" fill="#ff6b6b" />
      <rect x="16" y="76" width="188" height="74" fill="white" />
      <rect x="52" y="141" width="116" height="6" rx="3" fill="#2a2520" />
      <rect x="68" y="141" width="84" height="32" rx="2" fill="white" stroke="#e8e2da" strokeWidth="1" />
      <rect x="72" y="145" width="76" height="22" rx="1" fill="#f0ebe4" />
      <circle cx="110" cy="156" r="6" fill="#d4c8bc" opacity="0.6" />
      <ellipse cx="110" cy="174" rx="72" ry="5" fill="rgba(0,0,0,0.06)" />
    </svg>
  );
}

function deterministicRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return ((Math.abs(hash) % 13) - 6);
}

type DragState =
  | {
      type: "canvas";
      startClientX: number;
      startClientY: number;
      startOffsetX: number;
      startOffsetY: number;
    }
  | {
      type: "photo";
      photoId: string;
      grabOffsetX: number;
      grabOffsetY: number;
      element: HTMLElement;
      lastX: number;
      lastY: number;
      startClientX: number;
      startClientY: number;
      hasMoved: boolean;
    };

const DRAG_THRESHOLD = 6;
const FOCUS_DURATION = 520;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function computeFocusViewport(
  photo: Photo,
  containerW: number,
  containerH: number,
  currentZoom: number,
) {
  const px = photo.x ?? 0;
  const py = photo.y ?? 0;
  const targetZoom = Math.min(Math.max(currentZoom, 1.15), 1.45);
  const centerX = px + CARD_W / 2;
  const centerY = py + CARD_H / 2;
  return {
    zoom: targetZoom,
    offset: {
      x: containerW / 2 - centerX * targetZoom,
      y: containerH / 2 - centerY * targetZoom,
    },
  };
}

function clientToCanvas(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  offset: { x: number; y: number },
  zoom: number,
) {
  const rect = container.getBoundingClientRect();
  return {
    x: (clientX - rect.left - offset.x) / zoom,
    y: (clientY - rect.top - offset.y) / zoom,
  };
}

export function InfiniteCanvas({
  photos,
  onToggleHide,
  onUpdatePosition,
  onUpdateRotation,
  onDeletePhoto,
  eventName,
  zoom,
  offset,
  onZoomChange,
  onOffsetChange,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep latest values in refs so document-level handlers never use stale closures
  const zoomRef = useRef(zoom);
  const offsetRef = useRef(offset);
  const onZoomChangeRef = useRef(onZoomChange);
  const onOffsetChangeRef = useRef(onOffsetChange);
  const onUpdatePositionRef = useRef(onUpdatePosition);
  const photosRef = useRef(photos);
  const animFrameRef = useRef<number | null>(null);
  zoomRef.current = zoom;
  offsetRef.current = offset;
  onZoomChangeRef.current = onZoomChange;
  onOffsetChangeRef.current = onOffsetChange;
  onUpdatePositionRef.current = onUpdatePosition;
  photosRef.current = photos;

  const dragRef = useRef<DragState | null>(null);
  const containerRefForDrag = useRef<HTMLDivElement | null>(null);
  const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });

  containerRefForDrag.current = containerRef.current;

  const cancelViewportAnimation = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const animateViewport = useCallback(
    (target: { zoom: number; offset: { x: number; y: number } }, duration = FOCUS_DURATION) => {
      cancelViewportAnimation();
      const from = { zoom: zoomRef.current, offset: { ...offsetRef.current } };
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const e = easeOutCubic(t);
        const z = from.zoom + (target.zoom - from.zoom) * e;
        const o = {
          x: from.offset.x + (target.offset.x - from.offset.x) * e,
          y: from.offset.y + (target.offset.y - from.offset.y) * e,
        };
        onZoomChangeRef.current(z);
        onOffsetChangeRef.current(o);
        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [cancelViewportAnimation],
  );

  const focusPhoto = useCallback(
    (photoId: string) => {
      const container = containerRef.current;
      const photo = photosRef.current.find((p) => p.id === photoId);
      if (!container || !photo) return;

      const rect = container.getBoundingClientRect();
      const target = computeFocusViewport(photo, rect.width, rect.height, zoomRef.current);
      setFocusedPhotoId(photoId);
      animateViewport(target);
    },
    [animateViewport],
  );

  const focusPhotoRef = useRef(focusPhoto);
  focusPhotoRef.current = focusPhoto;

  const cancelViewportAnimationRef = useRef(cancelViewportAnimation);
  cancelViewportAnimationRef.current = cancelViewportAnimation;

  useEffect(() => () => cancelViewportAnimation(), [cancelViewportAnimation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      setViewportSize({ w: container.clientWidth, h: container.clientHeight });
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Document-level pointer move + up (1:1 cursor sync, no React lag during drag) ──
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.type === "canvas") {
        const dx = e.clientX - drag.startClientX;
        const dy = e.clientY - drag.startClientY;
        onOffsetChangeRef.current({ x: drag.startOffsetX + dx, y: drag.startOffsetY + dy });
        return;
      }

      if (drag.type === "photo") {
        if (!drag.hasMoved) {
          const dx = e.clientX - drag.startClientX;
          const dy = e.clientY - drag.startClientY;
          if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            drag.hasMoved = true;
            setDraggingPhotoId(drag.photoId);
            cancelViewportAnimationRef.current();
          }
        }

        if (!drag.hasMoved) return;

        const container = containerRefForDrag.current;
        if (!container) return;

        const { x: canvasX, y: canvasY } = clientToCanvas(
          e.clientX,
          e.clientY,
          container,
          offsetRef.current,
          zoomRef.current,
        );
        const newX = canvasX - drag.grabOffsetX;
        const newY = canvasY - drag.grabOffsetY;

        drag.element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        drag.lastX = newX;
        drag.lastY = newY;
        return;
      }
    };

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.type === "photo") {
        try {
          drag.element.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }

        if (!drag.hasMoved) {
          drag.element.style.removeProperty("transform");
          focusPhotoRef.current(drag.photoId);
        } else {
          flushSync(() => {
            onUpdatePositionRef.current(drag.photoId, drag.lastX, drag.lastY);
          });
          drag.element.style.removeProperty("transform");
          setFocusedPhotoId(null);
        }
      }

      dragRef.current = null;
      setDraggingPhotoId(null);
      setIsDraggingCanvas(false);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // ── Scroll-wheel zoom toward cursor ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const curZoom = zoomRef.current;
      const curOffset = offsetRef.current;
      const newZoom = Math.max(0.08, Math.min(4, curZoom * factor));
      const cx = (mx - curOffset.x) / curZoom;
      const cy = (my - curOffset.y) / curZoom;
      onZoomChangeRef.current(newZoom);
      onOffsetChangeRef.current({ x: mx - cx * newZoom, y: my - cy * newZoom });
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const startCanvasDrag = (e: React.PointerEvent) => {
    if (e.button !== 0 || dragRef.current) return;
    cancelViewportAnimation();
    setFocusedPhotoId(null);
    dragRef.current = {
      type: "canvas",
      startClientX: e.clientX,
      startClientY: e.clientY,
      startOffsetX: offsetRef.current.x,
      startOffsetY: offsetRef.current.y,
    };
    setIsDraggingCanvas(true);
  };

  const startPhotoDrag = (
    photoId: string,
    photoX: number,
    photoY: number,
    element: HTMLElement,
    e: React.PointerEvent,
  ) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    element.setPointerCapture(e.pointerId);

    const { x: canvasX, y: canvasY } = clientToCanvas(
      e.clientX,
      e.clientY,
      container,
      offsetRef.current,
      zoomRef.current,
    );

    dragRef.current = {
      type: "photo",
      photoId,
      grabOffsetX: canvasX - photoX,
      grabOffsetY: canvasY - photoY,
      element,
      lastX: photoX,
      lastY: photoY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      hasMoved: false,
    };
    setFocusedPhotoId(null);
  };

  const visible = photos.filter((p) => !p.hidden);
  const culled =
    viewportSize.w > 0
      ? visible.filter(
          (p) =>
            p.id === draggingPhotoId ||
            p.id === focusedPhotoId ||
            isPhotoInViewport(p, offset, zoom, viewportSize.w, viewportSize.h),
        )
      : visible;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "#f0ebe4",
        cursor: isDraggingCanvas ? "grabbing" : draggingPhotoId ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerDown={startCanvasDrag}
    >
      {/* Dot-grid background */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <pattern
            id="dotgrid"
            x={offset.x % (24 * zoom)}
            y={offset.y % (24 * zoom)}
            width={24 * zoom}
            height={24 * zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={12 * zoom} cy={12 * zoom} r={Math.max(0.5, zoom * 0.85)} fill="rgba(0,0,0,0.11)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* Canvas layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {/* Camera at canvas origin */}
        <div style={{ position: "absolute", left: -100, top: -82, pointerEvents: "none" }}>
          <PolaroidCameraIllustration />
        </div>

        {/* Photos */}
        {culled.map((photo) => {
          const px = photo.x ?? 0;
          const py = photo.y ?? 0;
          const isDragging = draggingPhotoId === photo.id;
          const isFocused = focusedPhotoId === photo.id;
          const userPhoto = isUserPhoto(photo.id);
          const rotation = userPhoto ? (photo.rotation ?? 0) : deterministicRotation(photo.id);

          return (
            <div
              key={photo.id}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: isDragging ? undefined : `translate3d(${px}px, ${py}px, 0)`,
                cursor: isDragging ? "grabbing" : userPhoto ? "grab" : "grab",
                zIndex: isDragging || isFocused ? 100 : userPhoto ? 50 : 1,
                touchAction: "none",
                overflow: "visible",
              }}
              onPointerDown={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("[data-no-drag]")) return;
                const el = e.currentTarget;
                startPhotoDrag(photo.id, px, py, el, e);
              }}
            >
              <PolaroidCard
                photo={photo}
                rotation={rotation}
                onToggleHide={onToggleHide}
                isAdmin={true}
                eventName={eventName}
                dragging={isDragging}
                focused={isFocused}
                isUserPhoto={userPhoto}
                onDelete={() => onDeletePhoto(photo.id)}
                onTilt={(r) => onUpdateRotation(photo.id, r)}
              />
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
          <p style={{ fontWeight: 700, color: "#1a1512", fontSize: "1.1rem" }}>
            Le mur est vide pour l'instant
          </p>
          <p style={{ color: "#a09890", fontSize: "0.85rem" }}>
            Soyez le premier à immortaliser l'événement !
          </p>
        </div>
      )}

      {/* Zoom % */}
      <div
        className="absolute bottom-4 left-4 px-2 py-1 rounded-lg pointer-events-none"
        style={{ background: "rgba(0,0,0,0.08)", fontSize: "0.68rem", fontWeight: 600, color: "#7a6f65" }}
      >
        {Math.round(zoom * 100)} %
      </div>
    </div>
  );
}

export function computeFitAll(
  photos: Photo[],
  containerW: number,
  containerH: number,
): { zoom: number; offset: { x: number; y: number } } {
  if (photos.length === 0) {
    return { zoom: 1, offset: { x: containerW / 2, y: containerH / 2 } };
  }
  const xs = photos.map((p) => p.x ?? 0);
  const ys = photos.map((p) => p.y ?? 0);
  const minX = Math.min(...xs) - 24;
  const maxX = Math.max(...xs) + CARD_W + 24;
  const minY = Math.min(...ys) - 24;
  const maxY = Math.max(...ys) + CARD_H + 24;
  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const newZoom = Math.min(containerW / contentW, containerH / contentH, 1.5) * 0.88;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    zoom: newZoom,
    offset: { x: containerW / 2 - cx * newZoom, y: containerH / 2 - cy * newZoom },
  };
}
