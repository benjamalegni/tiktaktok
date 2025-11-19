import { useEffect, useRef, useState, useCallback } from 'react';

interface PlaylistMusicOptions {
  volume?: number;
}

// Helper: Normalize URL/path to pathname for comparison
const toPathname = (src: string): string => {
  try {
    return new URL(src, window.location.origin).pathname;
  } catch {
    return src;
  }
};

// Helper: Wait for audio to be ready to play
const waitForAudioReady = (audio: HTMLAudioElement): Promise<void> => {
  if (audio.readyState >= 2) {
    return Promise.resolve();
  }
  
  return new Promise<void>(resolve => {
    const onReady = () => {
      audio.removeEventListener('canplay', onReady);
      resolve();
    };
    audio.addEventListener('canplay', onReady, { once: true });
  });
};

export const usePlaylistMusic = (
  playlist: string[],
  options: PlaylistMusicOptions = {}
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayRef = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(options.volume ?? 0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Initialize audio element and event listeners
  const initializeAudio = useCallback(() => {
    if (audioRef.current || playlist.length === 0) return;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audio.muted = false;
    audio.src = playlist[0];

    // Track ended: move to next track and auto-play
    audio.addEventListener('ended', () => {
      shouldAutoPlayRef.current = true;
      setCurrentTrack(prev => (prev + 1) % playlist.length);
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
      setHasPlayed(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    audioRef.current = audio;
  }, [playlist, volume]);

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  // Handle track changes and auto-play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;

    const currentPath = toPathname(audio.src);
    const newPath = toPathname(playlist[currentTrack]);

    // Only change source if track actually changed
    if (currentPath !== newPath) {
      const shouldAutoPlay = isPlaying || shouldAutoPlayRef.current;
      shouldAutoPlayRef.current = false;

      const handleCanPlay = () => {
        if (shouldAutoPlay) {
          audio.play().catch(err => {
            if (err?.name !== 'AbortError') {
              console.error('Auto-play failed:', err);
            }
          });
        }
        audio.removeEventListener('canplay', handleCanPlay);
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.src = playlist[currentTrack];
    }
  }, [currentTrack, isPlaying, playlist]);

  // Play audio: ensures correct volume and source before playing
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;

    // Check volume from audio element (setVolume updates it synchronously)
    // This ensures we get correct volume even if setVolume was just called
    if (audio.volume === 0) {
      console.warn('Cannot play: volume is 0');
      return;
    }

    try {
      audio.muted = false;

      // Ensure source matches current track
      const currentPath = toPathname(audio.src);
      const newPath = toPathname(playlist[currentTrack]);
      
      if (currentPath !== newPath || !audio.src) {
        audio.src = playlist[currentTrack];
        await waitForAudioReady(audio);
      }

      // Already playing - nothing to do
      if (!audio.paused) return;

      // Ready to play - resume or start
      if (audio.readyState >= 2) {
        await audio.play();
        return;
      }

      // Wait for ready, then play
      await waitForAudioReady(audio);
      await audio.play();
    } catch (err: unknown) {
      const error = err as { name?: string } | undefined;
      if (error?.name === 'AbortError') return;

      console.error('Error playing music:', err);
      
      // Retry: reload and play
      const retryAudio = audioRef.current;
      if (!retryAudio) return;

      try {
        retryAudio.muted = false;
        retryAudio.volume = volume;
        
        if (retryAudio.readyState < 4) {
          retryAudio.load();
          await waitForAudioReady(retryAudio);
        }
        
        await retryAudio.play();
      } catch (retryErr) {
        console.error('Retry play failed:', retryErr);
      }
    }
  }, [playlist, currentTrack, volume]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
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