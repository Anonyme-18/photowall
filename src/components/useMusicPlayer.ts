import { useEffect, useRef, useState } from "react";
import { MUSIC_LIBRARY, type Track } from "./musicLibrary";

const FADE_DURATION = 1200; // ms

export function useMusicPlayer(autoPlay = true) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.55);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrack: Track = MUSIC_LIBRARY[trackIndex];

  // Fade helper
  function fadeTo(audio: HTMLAudioElement, targetVol: number, onDone?: () => void) {
    if (fadeRef.current) clearInterval(fadeRef.current);
    const step = (targetVol - audio.volume) / (FADE_DURATION / 50);
    fadeRef.current = setInterval(() => {
      const next = audio.volume + step;
      if ((step > 0 && next >= targetVol) || (step < 0 && next <= targetVol)) {
        audio.volume = Math.max(0, Math.min(1, targetVol));
        clearInterval(fadeRef.current!);
        onDone?.();
      } else {
        audio.volume = Math.max(0, Math.min(1, next));
      }
    }, 50);
  }

  // Mount / src change → create / update Audio element
  useEffect(() => {
    let audio = audioRef.current;

    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
    }

    // Fade out old track then swap src
    const prev = audio;
    fadeTo(prev, 0, () => {
      prev.pause();
      prev.src = currentTrack.src;
      prev.load();
      if (playing) {
        prev.play().then(() => fadeTo(prev, volume)).catch(() => {});
      }
    });

    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  // Play / pause toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().then(() => fadeTo(audio, volume)).catch(() => {});
    } else {
      fadeTo(audio, 0, () => audio.pause());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Volume change
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && playing) fadeTo(audio, volume);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      fadeTo(audio, 0, () => { audio.pause(); audio.src = ""; });
    };
  }, []);

  function nextTrack() {
    setTrackIndex((i) => (i + 1) % MUSIC_LIBRARY.length);
  }

  function prevTrack() {
    setTrackIndex((i) => (i - 1 + MUSIC_LIBRARY.length) % MUSIC_LIBRARY.length);
  }

  function selectTrack(index: number) {
    setTrackIndex(index);
    setPlaying(true);
  }

  return {
    currentTrack,
    trackIndex,
    playing,
    volume,
    setPlaying,
    setVolume,
    nextTrack,
    prevTrack,
    selectTrack,
    library: MUSIC_LIBRARY,
  };
}
