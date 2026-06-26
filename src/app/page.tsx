"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { useAppContext } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { InfiniteCanvas, computeFitAll } from "@/components/InfiniteCanvas";
import { UploadModal } from "@/components/UploadModal";
import { SlideshowMode } from "@/components/SlideshowMode";
import { MeetupTab } from "@/components/MeetupTab";
import { BottomBar } from "@/components/BottomBar";
import { getBottomBarHeight, getHeaderHeight } from "@/lib/layout";

const BOTTOMBAR_H = getBottomBarHeight();

export default function PhotoWallPage() {
  const {
    photos,
    isLoading,
    addPhoto,
    toggleHide,
    deletePhoto,
    updatePhotoPosition,
    updatePhotoRotation,
    eventConfig,
  } = useAppContext();

  const visibleTabs = eventConfig.tabs.filter((t) => t.id !== "event");

  const [activeTab, setActiveTab] = useState("wall");
  const [showUpload, setShowUpload] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [newPhotoCount, setNewPhotoCount] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const overviewApplied = useRef(false);

  const applyOverview = useCallback(() => {
    const headerH = getHeaderHeight();
    const containerW = window.innerWidth;
    const containerH = window.innerHeight - headerH - BOTTOMBAR_H;
    const result = computeFitAll(photos, containerW, containerH);
    setZoom(result.zoom);
    setOffset({ x: result.offset.x, y: result.offset.y + headerH });
  }, [photos]);

  useEffect(() => {
    if (isLoading || overviewApplied.current) return;
    if (photos.length === 0) return;
    applyOverview();
    overviewApplied.current = true;
  }, [isLoading, photos, applyOverview]);

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab("wall");
    }
  }, [activeTab, visibleTabs]);

  const handleRecenter = useCallback(() => {
    const headerH = getHeaderHeight();
    setZoom(1);
    setOffset({
      x: window.innerWidth / 2,
      y: (window.innerHeight - headerH - BOTTOMBAR_H) / 2 + headerH,
    });
  }, []);

  const handleOverview = useCallback(() => {
    applyOverview();
  }, [applyOverview]);

  const handleUpload = useCallback(
    async (data: Parameters<typeof addPhoto>[0]) => {
      await addPhoto(data);
      setNewPhotoCount((c) => c + 1);
    },
    [addPhoto],
  );

  const visibleCount = photos.filter((p) => !p.hidden).length;

  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: "#f0ebe4" }}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSlideshowToggle={() => setShowSlideshow(true)}
        photoCount={visibleCount}
        eventName={eventConfig.name}
        eventSubtitle={eventConfig.subtitle}
        tabs={visibleTabs}
      />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeTab === "wall" && (
          <InfiniteCanvas
            photos={photos}
            onToggleHide={toggleHide}
            onUpdatePosition={updatePhotoPosition}
            onUpdateRotation={updatePhotoRotation}
            onDeletePhoto={deletePhoto}
            eventName={eventConfig.name}
            zoom={zoom}
            offset={offset}
            onZoomChange={setZoom}
            onOffsetChange={setOffset}
          />
        )}
        {activeTab === "meetup" && (
          <div className="h-full overflow-y-auto">
            <MeetupTab />
          </div>
        )}
      </div>

      <BottomBar
        onAddPhoto={() => setShowUpload(true)}
        onOverview={handleOverview}
        onRecenter={handleRecenter}
        onZoomIn={() => setZoom((z) => Math.min(4, z * 1.2))}
        onZoomOut={() => setZoom((z) => Math.max(0.08, z / 1.2))}
        zoom={zoom}
        newPhotoCount={newPhotoCount}
        showWallControls={activeTab === "wall"}
      />

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUpload={handleUpload}
            eventName={eventConfig.name}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSlideshow && (
          <SlideshowMode photos={photos} onClose={() => setShowSlideshow(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
