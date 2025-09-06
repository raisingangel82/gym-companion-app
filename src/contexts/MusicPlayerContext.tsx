import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  downloadURL: string;
  coverURL?: string | null;
  fileName: string;
}

interface MusicContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isShuffleActive: boolean;
  loadPlaylistAndPlay: (playlist: Song[], startIndex: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const loadPlaylistAndPlay = useCallback((newPlaylist: Song[], startIndex: number) => {
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(startIndex);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffleActive(prev => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length <= 1) return;

    if (isShuffleActive) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (playlist.length > 1 && nextIndex === currentTrackIndex);
      setCurrentTrackIndex(nextIndex);
    } else {
      const nextIndex = ((currentTrackIndex ?? -1) + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
    }
  }, [playlist, currentTrackIndex, isShuffleActive]);
  
  const playPrevious = useCallback(() => {
    if (playlist.length <= 1) return;

    if (isShuffleActive) {
      let prevIndex;
      do {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } while (playlist.length > 1 && prevIndex === currentTrackIndex);
      setCurrentTrackIndex(prevIndex);
    } else {
      const prevIndex = ((currentTrackIndex ?? 0) - 1 + playlist.length) % playlist.length;
      setCurrentTrackIndex(prevIndex);
    }
  }, [playlist, currentTrackIndex, isShuffleActive]);

  const togglePlayPause = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack]);
  
  // === MODIFICA CHIAVE: ABBIAMO DIVISO IL VECCHIO useEffect IN DUE ===

  // Effetto #1: Gestisce il CAMBIO di traccia.
  // Si attiva solo quando 'currentTrack' cambia.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      // Se la traccia è diversa da quella attuale, la carichiamo e avviamo la riproduzione.
      if (audio.src !== currentTrack.downloadURL) {
        audio.src = currentTrack.downloadURL;
        setIsPlaying(true);
      }
    }
  }, [currentTrack]);

  // Effetto #2: Gestisce il PLAY/PAUSA.
  // Si attiva solo quando 'isPlaying' cambia.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => console.error("Errore di riproduzione:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const value = {
    currentTrack,
    isPlaying,
    isShuffleActive,
    loadPlaylistAndPlay,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
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