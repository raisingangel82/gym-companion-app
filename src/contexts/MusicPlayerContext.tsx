// src/contexts/MusicPlayerContext.tsx

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  downloadURL: string;
}

interface MusicContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  loadPlaylistAndPlay: (playlist: Song[], startIndex: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const loadPlaylistAndPlay = useCallback((newPlaylist: Song[], startIndex: number) => {
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(startIndex);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [isPlaying]);

  const playNext = useCallback(() => {
    if (playlist.length > 0 && currentTrackIndex !== null) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
      setIsPlaying(true);
    }
  }, [playlist, currentTrackIndex]);

  const playPrevious = useCallback(() => {
    if (playlist.length > 0 && currentTrackIndex !== null) {
      const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      setCurrentTrackIndex(prevIndex);
      setIsPlaying(true);
    }
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (audioRef.current.src !== currentTrack.downloadURL) {
        audioRef.current.src = currentTrack.downloadURL;
      }

      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Errore di riproduzione:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);


  const value = {
    currentTrack,
    isPlaying,
    loadPlaylistAndPlay,
    togglePlayPause,
    playNext,
    playPrevious,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={playNext}
        onError={(e) => console.error("Errore elemento audio:", e)}
      />
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};