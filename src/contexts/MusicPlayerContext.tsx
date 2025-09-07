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

  // MODIFICA: Aggiungiamo esplicitamente l'istruzione di avviare la riproduzione
  const loadPlaylistAndPlay = useCallback((newPlaylist: Song[], startIndex: number) => {
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(startIndex);
    setIsPlaying(true); // <-- Dice esplicitamente di suonare
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffleActive(prev => !prev);
  }, []);

  // MODIFICA: Aggiungiamo esplicitamente l'istruzione di avviare la riproduzione
  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    if (playlist.length === 1) {
        // Se c'è una sola canzone, falla ripartire
        if(audioRef.current) audioRef.current.currentTime = 0;
        setIsPlaying(true);
        return;
    }

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
    setIsPlaying(true); // <-- Dice esplicitamente di suonare
  }, [playlist, currentTrackIndex, isShuffleActive]);
  
  // MODIFICA: Aggiungiamo esplicitamente l'istruzione di avviare la riproduzione
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
    setIsPlaying(true); // <-- Dice esplicitamente di suonare
  }, [playlist, currentTrackIndex, isShuffleActive]);

  const togglePlayPause = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack]);
  
  // MODIFICA: Torniamo a un unico useEffect, ma più robusto
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Se cambia la traccia, aggiorna la sorgente
    if (currentTrack && audio.src !== currentTrack.downloadURL) {
      audio.src = currentTrack.downloadURL;
    }

    // Gestiamo play/pausa in base allo stato
    if (isPlaying) {
      // audio.play() restituisce una Promise. La gestiamo per evitare errori
      // di "autoplay" bloccato dal browser, specialmente dopo onEnded.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Errore di riproduzione automatica:", error);
          // Se il browser blocca l'autoplay, aggiorniamo lo stato per riflettere la realtà
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

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