import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Photo } from "@/components/types";
import { DEFAULT_EVENT_CONFIG, type EventConfig } from "@/lib/types/event";
import { mergePhotosIfChanged } from "@/lib/photos/compare";
import * as api from "@/lib/api/client";

export type { EventConfig };

interface AppContextValue {
  photos: Photo[];
  isLoading: boolean;
  addPhoto: (p: {
    author: string;
    aspectRatio: number;
    accentColor?: string;
    x?: number;
    y?: number;
    url?: string;
    imageBlob?: Blob;
  }) => Promise<void>;
  toggleHide: (id: string) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  updatePhotoPosition: (id: string, x: number, y: number) => Promise<void>;
  updatePhotoRotation: (id: string, rotation: number) => Promise<void>;
  eventConfig: EventConfig;
  setEventConfig: (cfg: EventConfig) => Promise<void>;
  refreshPhotos: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const POLL_INTERVAL_MS = 12_000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [eventConfig, setEventConfigState] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const refreshPhotos = useCallback(async () => {
    const data = await api.fetchPhotos();
    setPhotos((prev) => mergePhotosIfChanged(prev, data));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [photosData, configData] = await Promise.all([
          api.fetchPhotos(),
          api.fetchEventConfig(),
        ]);
        if (!cancelled) {
          setPhotos(photosData);
          setEventConfigState(configData);
        }
      } catch (err) {
        console.error("Erreur chargement données :", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let polling = false;

    const poll = async () => {
      if (polling || cancelled) return;
      polling = true;
      try {
        const data = await api.fetchPhotos();
        if (!cancelled) {
          setPhotos((prev) => mergePhotosIfChanged(prev, data));
        }
      } catch {
        /* silencieux en polling */
      } finally {
        polling = false;
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const addPhoto = useCallback(
    async (data: {
      author: string;
      aspectRatio: number;
      accentColor?: string;
      x?: number;
      y?: number;
      url?: string;
      imageBlob?: Blob;
    }) => {
      const photo = await api.createPhoto({
        image: data.imageBlob,
        url: data.url,
        author: data.author,
        aspectRatio: data.aspectRatio,
        accentColor: data.accentColor,
        x: data.x,
        y: data.y,
      });
      setPhotos((prev) => [photo, ...prev.filter((p) => p.id !== photo.id)]);
    },
    [],
  );

  const toggleHide = useCallback(async (id: string) => {
    const current = photosRef.current.find((p) => p.id === id);
    if (!current) return;

    const hidden = !current.hidden;
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, hidden } : p)));

    try {
      const updated = await api.patchPhoto(id, { hidden });
      setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, hidden: current.hidden } : p)));
      throw err;
    }
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    const snapshot = photosRef.current;
    setPhotos((prev) => prev.filter((p) => p.id !== id));

    try {
      await api.removePhoto(id);
    } catch (err) {
      setPhotos(snapshot);
      throw err;
    }
  }, []);

  const updatePhotoPosition = useCallback(async (id: string, x: number, y: number) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));

    try {
      await api.patchPhoto(id, { x, y });
    } catch (err) {
      console.error("Erreur sauvegarde position :", err);
    }
  }, []);

  const updatePhotoRotation = useCallback(async (id: string, rotation: number) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, rotation } : p)));

    try {
      await api.patchPhoto(id, { rotation });
    } catch (err) {
      console.error("Erreur sauvegarde rotation :", err);
    }
  }, []);

  const setEventConfig = useCallback(async (cfg: EventConfig) => {
    const saved = await api.saveEventConfig(cfg);
    setEventConfigState(saved);
  }, []);

  return (
    <AppContext.Provider
      value={{
        photos,
        isLoading,
        addPhoto,
        toggleHide,
        deletePhoto,
        updatePhotoPosition,
        updatePhotoRotation,
        eventConfig,
        setEventConfig,
        refreshPhotos,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
