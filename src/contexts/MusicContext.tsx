import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  getPlayerState: () => number;
  getVideoData: () => { title: string; video_id: string };
}

// Interfaccia per gli eventi del player
interface PlayerEvent {
  target: YouTubePlayer;
  data: number;
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
  // NUOVE FUNZIONI ESPORTATE
  handlePlayerStateChange: (event: PlayerEvent) => void;
  handlePlayerError: (event: { data: number }) => void;
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
    if (videoId === id) {
      setVideoId(null);
      setTimeout(() => setVideoId(id), 0);
    } else {
      setVideoId(id);
    }
    setPlaylistId(null);
    setIsPlaying(true);
  };

  const playPlaylist = (id: string) => {
    setVideoId(null);
    setIsPlaying(true);
    if (playlistId === id) {
      setPlaylistId(null);
      setTimeout(() => {
        setPlaylistId(id);
      }, 0);
    } else {
      setPlaylistId(id);
    }
  };
  
  const stopMusic = () => {
    setVideoId(null);
    setPlaylistId(null);
    setIsPlaying(false);
    setCurrentTrack({ id: null, title: null });
  };

  const nextTrack = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.nextVideo();
    }
  }, []);

  const previousTrack = () => playerRef.current?.previousVideo();

  // NUOVA FUNZIONE: Gestisce gli errori del player
  // Se il player va in errore (spesso per un video non disponibile o un problema con l'ad),
  // semplicemente salta alla traccia successiva.
  const handlePlayerError = useCallback((event: { data: number }) => {
    console.error(`Youtubeer Error: ${event.data}`);
    if (playlistId) {
      console.log("Player in errore, tento di passare alla traccia successiva...");
      nextTrack();
    }
  }, [playlistId, nextTrack]);

  // MODIFICA: La logica di gestione dello stato è ora centralizzata qui
  const handlePlayerStateChange = useCallback((event: PlayerEvent) => {
    const playerState = event.data;

    // Stato 0 = Canzone finita. Se siamo in una playlist, andiamo alla successiva.
    if (playerState === 0 && playlistId) {
      nextTrack();
    }
    // Stato 1 = In Riproduzione. Aggiorniamo le info della traccia corrente.
    else if (playerState === 1) {
      const trackData = event.target.getVideoData();
      if (trackData.video_id) {
        setCurrentTrack({ id: trackData.video_id, title: trackData.title });
      }
    }
  }, [playlistId, nextTrack]);


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
    previousTrack,
    // Esportiamo le nuove funzioni
    handlePlayerStateChange,
    handlePlayerError
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