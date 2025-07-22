// src/contexts/MusicContext.tsx
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
}

interface MusicContextType {
  videoId: string;
  setVideoId: (id: string) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  // Ref per il player decorativo sulla pagina Musica
  decorativePlayerRef: React.MutableRefObject<YouTubePlayer | null>; 
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [videoId, setVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const decorativePlayerRef = useRef<YouTubePlayer | null>(null); // Aggiunto

  const handleSetVideoId = (id: string) => {
    setVideoId(id);
    setIsPlaying(!!id);
  };

  const value = { videoId, setVideoId: handleSetVideoId, isPlaying, setIsPlaying, playerRef, decorativePlayerRef };

  return (
    <MusicContext.Provider value={value}>
      {children}
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