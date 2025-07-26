import { createContext, useContext, useState, useRef, type ReactNode } from 'react';

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  getPlayerState: () => number;
  getVideoData: () => { title: string; video_id: string };
}

interface MusicContextType {
  videoId: string | null;
  playlistId: string | null;
  currentTrack: { id: string | null; title: string | null };
  setCurrentTrack: (track: { id: string | null; title: string | null }) => void;
  playTrack: (id: string) => void;
  playPlaylist: (id: string) => void;
  stopMusic: () => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  decorativePlayerRef: React.MutableRefObject<YouTubePlayer | null>;
  nextTrack: () => void;
  previousTrack: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{ id: string | null; title: string | null }>({ id: null, title: null });
  const playerRef = useRef<YouTubePlayer | null>(null);
  const decorativePlayerRef = useRef<YouTubePlayer | null>(null);

  const playTrack = (id: string) => {
    // Se si sta ricaricando la stessa traccia, forziamo il reset
    if (videoId === id) {
      setVideoId(null);
      setTimeout(() => setVideoId(id), 0);
    } else {
      setVideoId(id);
    }
    setPlaylistId(null);
    setIsPlaying(true);
  };

  // --- MODIFICA CHIAVE ALLA LOGICA ---
  const playPlaylist = (id: string) => {
    setVideoId(null); // Ferma qualsiasi traccia singola
    setIsPlaying(true);

    // Se stiamo tentando di ricaricare la STESSA playlist, dobbiamo forzare un re-render.
    // Lo facciamo impostando l'ID a null e poi di nuovo all'ID corretto subito dopo.
    // Il setTimeout(..., 0) assicura che React processi i due aggiornamenti separatamente.
    if (playlistId === id) {
      setPlaylistId(null);
      setTimeout(() => {
        setPlaylistId(id);
      }, 0);
    } else {
      // Se è una playlist nuova, la impostiamo normalmente.
      setPlaylistId(id);
    }
  };
  // --- FINE MODIFICA ---
  
  const stopMusic = () => {
    setVideoId(null);
    setPlaylistId(null);
    setIsPlaying(false);
    setCurrentTrack({ id: null, title: null });
  };

  const nextTrack = () => playerRef.current?.nextVideo();
  const previousTrack = () => playerRef.current?.previousVideo();

  const value = { 
    videoId, 
    playlistId,
    currentTrack,
    setCurrentTrack,
    playTrack, 
    playPlaylist,
    stopMusic,
    isPlaying, 
    setIsPlaying, 
    playerRef, 
    decorativePlayerRef,
    nextTrack,
    previousTrack
  };

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