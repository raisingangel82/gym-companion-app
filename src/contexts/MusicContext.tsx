// src/contexts/MusicContext.tsx

import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface MusicContextType {
  videoUrl: string;
  isPlaying: boolean;
  playVideo: (url: string) => void;
  togglePlayPause: () => void;
  // Questo 'ref' ci permetterà di controllare direttamente il player di YouTube
  playerRef: React.RefObject<any>; 
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Usiamo un 'ref' per mantenere un riferimento al componente del player
  // anche quando i componenti si ri-renderizzano.
  const playerRef = useRef<any>(null);

  // Funzione per avviare un nuovo video
  const playVideo = (url: string) => {
    setVideoUrl(url);
    setIsPlaying(true);
  };

  // Funzione per mettere in play/pausa
  const togglePlayPause = () => {
    // Non fare nulla se non c'è un video caricato
    if (!videoUrl || !playerRef.current) return;
    
    // Usa i metodi dell'API di YouTube attraverso il ref
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
    // Aggiorna lo stato
    setIsPlaying(prevState => !prevState);
  };
  
  const value = { videoUrl, isPlaying, playVideo, togglePlayPause, playerRef };

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
