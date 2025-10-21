import { useEffect, useRef, useState, useCallback } from 'react';

interface PlaylistMusicOptions {
  volume?: number;
}

// Keep the export name you are using in App.tsx.
// If you're importing musicPlayer, export it as musicPlayer.
// If you're importing usePlaylistMusic, rename accordingly.
export const usePlaylistMusic = (
  playlist: string[],
  options: PlaylistMusicOptions = {}
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(options.volume ?? 0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  // This ref ensures we only auto-play after a track change when appropriate
  const shouldAutoPlayRef = useRef(false);

  // Normalize a URL or path to pathname so absolute vs relative compare works
  const toPathname = (src: string) => {
    try {
      return new URL(src, window.location.origin).pathname;
    } catch {
      return src;
    }
  };

  // Initialize audio element and base listeners (only once)
  const initializeAudio = useCallback(() => {
    if (!audioRef.current && playlist.length > 0) {
      const a = new Audio();
      a.preload = 'auto';
      a.volume = volume;
      a.muted = false;

      a.addEventListener('ended', () => {
        // When a track ends, select next and mark we want to auto-play it
        shouldAutoPlayRef.current = true;
        setCurrentTrack(prev => (prev + 1) % playlist.length);
      });

      a.addEventListener('play', () => {
        setIsPlaying(true);
        setHasPlayed(true);
      });

      a.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      a.src = playlist[0];
      audioRef.current = a;
    }
  }, [playlist, volume]);

  // One-time init
  useEffect(() => {
    if (!audioRef.current && playlist.length > 0) {
      initializeAudio();
    }
  }, [initializeAudio, playlist.length]);

  // Handle track change: set src, then wait for canplay to call play once
  useEffect(() => {
    const a = audioRef.current;
    if (!a || playlist.length === 0) return;

    const currentPath = toPathname(a.src);
    const newPath = toPathname(playlist[currentTrack]);

    // Only change source if really different (avoid redundant loads)
    if (currentPath !== newPath) {
      const wantAutoPlay = isPlaying || shouldAutoPlayRef.current;
      shouldAutoPlayRef.current = false;

      const handleCanPlay = () => {
        // Only attempt to play after the new source is fully buffered enough
        if (wantAutoPlay) {
          a.play().catch(err => {
            // Ignore AbortError (new load interrupted a pending play)
            if (err?.name !== 'AbortError') console.error('play failed:', err);
          });
        }
        a.removeEventListener('canplay', handleCanPlay);
      };

      a.addEventListener('canplay', handleCanPlay);
      a.src = playlist[currentTrack]; // this triggers loading; canplay will follow
    }
  }, [currentTrack, isPlaying, playlist]);

  // Public controls
  const play = useCallback(async () => {
    const a = audioRef.current;
    if (!a || playlist.length === 0) return;

    try {
      a.muted = false;
      a.volume = volume;

      // If not ready, wait for canplay once, then play
      if (a.readyState < 2) {
        await new Promise<void>(resolve => {
          const onReady = () => {
            a.removeEventListener('canplay', onReady);
            resolve();
          };
          a.addEventListener('canplay', onReady, { once: true });
        });
      }
      await a.play();
    } catch (err: unknown) {
      const e = err as { name?: string } | undefined;
      if (e?.name !== 'AbortError') console.error('Error playing music:', err);
    }
  }, [playlist.length, volume]);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (a) a.pause();
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const v = Math.max(0, Math.min(1, newVolume));
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return {
    play,
    pause,
    setVolume,
    isPlaying,
    volume,
    hasPlayed,
    currentTrack
  };
};