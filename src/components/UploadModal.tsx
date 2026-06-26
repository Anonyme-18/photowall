import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Share2, Camera, ImageIcon, ChevronLeft, Check, SwitchCamera, Circle } from "lucide-react";

interface UploadModalProps {
  onClose: () => void;
  onUpload: (photo: {
    author: string;
    aspectRatio: number;
    accentColor: string;
    imageBlob: Blob;
  }) => void | Promise<void>;
  eventName?: string;
}

const ACCENT_COLORS = [
  { hex: "#f5c842" }, { hex: "#27c93f" }, { hex: "#17c4c4" }, { hex: "#1a1512" },
  { hex: "#ff6b35" }, { hex: "#e91e8c" }, { hex: "#9c27b0" }, { hex: "#2196f3" },
  { hex: "#f44336" }, { hex: "#f0ebe4" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_PREVIEW_DIM = 1200;
const JPEG_QUALITY = 0.78;

function compressImage(
  file: File,
  maxWidth = MAX_PREVIEW_DIM,
  quality = JPEG_QUALITY,
): Promise<{ blob: Blob; aspectRatio: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no ctx"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("compression failed"));
          resolve({ blob, aspectRatio: width / height });
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Step = "method" | "camera" | "preview";
type FacingMode = "environment" | "user";

export function UploadModal({ onClose, onUpload, eventName = "Photowall" }: UploadModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0].hex);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [cameraReady, setCameraReady] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearPreview = useCallback(() => {
    setPreviewBlob(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const setPreviewFromBlob = useCallback((blob: Blob, ratio: number) => {
    setPreviewBlob(blob);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
    setAspectRatio(ratio);
    setStep("preview");
  }, []);

  useEffect(() => () => clearPreview(), [clearPreview]);

  // Stop camera stream on unmount or when leaving camera step
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async (facing: FacingMode = "environment") => {
    stopCamera();
    setError(null);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setFacingMode(facing);
      setStep("camera");
    } catch {
      setError("Accès à la caméra refusé. Vérifiez les permissions du navigateur.");
    }
  }, [stopCamera]);

  const flipCamera = useCallback(() => {
    startCamera(facingMode === "environment" ? "user" : "environment");
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror if front-facing
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        setPreviewFromBlob(blob, video.videoWidth / video.videoHeight);
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  }, [cameraReady, facingMode, stopCamera, setPreviewFromBlob]);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) { setError("Format non supporté. Utilisez JPG, PNG ou WebP."); return; }
    if (file.size > MAX_FILE_SIZE) { setError("Fichier trop lourd (max 10 Mo)."); return; }
    try {
      const { blob, aspectRatio: ratio } = await compressImage(file);
      setPreviewFromBlob(blob, ratio);
    } catch {
      setError("Impossible de lire l'image.");
    }
  }, [setPreviewFromBlob]);

  const handleSubmit = async () => {
    if (!previewBlob) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload({
        imageBlob: previewBlob,
        author: author.trim(),
        aspectRatio,
        accentColor,
      });
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi de la photo");
      setSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    clearPreview();
    onClose();
  };

  const goBack = () => {
    stopCamera();
    clearPreview();
    setStep("method");
    setError(null);
  };

  const isLight = accentColor === "#f5c842" || accentColor === "#f0ebe4" || accentColor === "#27c93f";
  const textOnAccent = isLight ? "#1a1512" : "white";

  const titles: Record<Step, string> = {
    method: "Ajouter une photo",
    camera: "Appareil photo",
    preview: "Ta photo",
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.24)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              {step !== "method" && (
                <button
                  onClick={goBack}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  style={{ color: "#717182" }}
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
              )}
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f0f1a" }}>
                {titles[step]}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: "#717182" }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* ── Step 1: method ── */}
          {step === "method" && (
            <div className="px-4 pb-6 space-y-2.5">
              <button
                onClick={() => startCamera("environment")}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all hover:bg-gray-50 active:scale-[0.98] text-left"
                style={{ border: "1.5px solid rgba(0,0,0,0.09)" }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#1a1512" }}>
                  <Camera size={22} color="white" strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f0f1a" }}>Appareil photo</p>
                  <p style={{ fontSize: "0.76rem", color: "#717182", marginTop: "2px" }}>Prendre une photo maintenant</p>
                </div>
              </button>

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all hover:bg-gray-50 active:scale-[0.98] text-left"
                style={{ border: "1.5px solid rgba(0,0,0,0.09)" }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <ImageIcon size={22} style={{ color: "#1a1512" }} strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f0f1a" }}>Importer</p>
                  <p style={{ fontSize: "0.76rem", color: "#717182", marginTop: "2px" }}>Choisir depuis votre galerie</p>
                </div>
              </button>

              {error && (
                <p style={{ fontSize: "0.78rem", color: "#d4183d", textAlign: "center", paddingTop: "2px" }}>{error}</p>
              )}
            </div>
          )}

          {/* ── Step 2: live camera ── */}
          {step === "camera" && (
            <div className="pb-5">
              {/* Video viewfinder */}
              <div className="relative mx-4 rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onCanPlay={() => setCameraReady(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: facingMode === "user" ? "scaleX(-1)" : "none",
                  }}
                />
                {/* Loading overlay */}
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2 a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                {/* Flip camera button */}
                <button
                  onClick={flipCamera}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80 active:scale-90"
                  style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                  title="Retourner la caméra"
                >
                  <SwitchCamera size={17} color="white" strokeWidth={2} />
                </button>
              </div>

              {/* Capture button */}
              <div className="flex justify-center mt-5">
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                  style={{ background: "#1a1512", color: "white", fontWeight: 700, fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                >
                  <Circle size={16} strokeWidth={2.5} fill="white" />
                  Prendre la photo
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: preview + customise ── */}
          {step === "preview" && previewUrl && previewBlob && (
            <div className="px-4 pb-6 space-y-4">
              {/* Polaroid preview */}
              <div className="flex justify-center pt-1">
                <div className="bg-white" style={{ width: "172px", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
                  <div className="flex items-center justify-center" style={{ background: accentColor, height: "26px" }}>
                    <span style={{ fontFamily: "'Bangers', cursive", fontSize: "0.7rem", letterSpacing: "0.14em", color: textOnAccent, textTransform: "uppercase" }}>
                      {eventName}
                    </span>
                  </div>
                  <div style={{ margin: "5px 5px 0", aspectRatio: "1/1", overflow: "hidden" }}>
                    <img src={previewUrl} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div className="flex items-center justify-center" style={{ height: "32px" }}>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: "#3d3530" }}>
                      {author || "Vous"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Author */}
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#717182", display: "block", marginBottom: "6px" }}>
                  Votre nom ou celui du groupe
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="ex : Marie"
                  maxLength={40}
                  className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all"
                  style={{ background: "#f3f3f5", border: "1.5px solid transparent", fontSize: "0.9rem", color: "#0f0f1a" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#1a1512"; e.currentTarget.style.background = "white"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f3f3f5"; }}
                />
              </div>

              {/* Color picker */}
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#717182", display: "block", marginBottom: "8px" }}>
                  Couleur de la carte
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setAccentColor(c.hex)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-95"
                      style={{
                        background: c.hex,
                        border: c.hex === "#f0ebe4" ? "1.5px solid rgba(0,0,0,0.15)" : "2px solid transparent",
                        boxShadow: accentColor === c.hex ? "0 0 0 2px white, 0 0 0 4px #1a1512" : "none",
                        transform: accentColor === c.hex ? "scale(1.15)" : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    if (navigator.share) navigator.share({ title: `${eventName} – Photo Wall`, url: window.location.href });
                    else navigator.clipboard.writeText(window.location.href);
                  }}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl flex-1 transition-all hover:bg-gray-50"
                  style={{ border: "1.5px solid rgba(0,0,0,0.12)", fontSize: "0.82rem", fontWeight: 600, color: "#1a1512" }}
                >
                  <Share2 size={14} strokeWidth={2.2} />
                  Partager
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading || success}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl flex-[2] transition-all disabled:opacity-60"
                  style={{ background: success ? "#16a34a" : "#1a1512", color: "white", fontWeight: 700, fontSize: "0.85rem", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                >
                  {success ? (
                    <><Check size={16} strokeWidth={2.5} /> Épinglée !</>
                  ) : uploading ? (
                    <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2 a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg> Envoi…</>
                  ) : <>Épingler au mur</>}
                </button>
              </div>
            </div>
          )}

          {/* Hidden gallery input */}
          <input
            ref={galleryInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
