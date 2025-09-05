import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  downloadURL: string;
  coverURL?: string | null;
}

interface MusicContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  isShuffleActive: boolean; // NUOVO STATO
  loadPlaylistAndPlay: (playlist: Song[], startIndex: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void; // NUOVA FUNZIONE
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffleActive, setIsShuffleActive] = useState(false); // DEFINIZIONE DELLO STATO
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const loadPlaylistAndPlay = useCallback((newPlaylist: Song[], startIndex: number) => {
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(startIndex);
  }, []);

  // NUOVA FUNZIONE PER ATTIVARE/DISATTIVARE LO SHUFFLE
  const toggleShuffle = useCallback(() => {
    setIsShuffleActive(prev => !prev);
  }, []);

  // LOGICA AGGIORNATA PER playNext
  const playNext = useCallback(() => {
    if (playlist.length <= 1) return;

    if (isShuffleActive) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (playlist.length > 1 && nextIndex === currentTrackIndex); // Evita di ripetere lo stesso brano
      setCurrentTrackIndex(nextIndex);
    } else {
      const nextIndex = ((currentTrackIndex ?? -1) + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
    }
  }, [playlist, currentTrackIndex, isShuffleActive]);
  
  // LOGICA AGGIORNATA PER playPrevious
  const playPrevious = useCallback(() => {
    if (playlist.length <= 1) return;

    if (isShuffleActive) {
      // In modalità shuffle, "previous" è semplicemente un altro brano casuale
      let prevIndex;
      do {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } while (playlist.length > 1 && prevIndex === currentTrackIndex); // Evita di ripetere lo stesso brano
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
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Se cambia la traccia, aggiorna la sorgente e avvia la riproduzione
    if (currentTrack && audio.src !== currentTrack.downloadURL) {
      audio.src = currentTrack.downloadURL;
      setIsPlaying(true); // Imposta isPlaying a true per far partire la nuova traccia
    }

    // Gestisce play/pausa in base allo stato
    if (isPlaying) {
      audio.play().catch(e => console.error("Errore di riproduzione:", e));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  const value = {
    currentTrack,
    isPlaying,
    isShuffleActive, // Esponiamo il nuovo stato
    loadPlaylistAndPlay,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle, // Esponiamo la nuova funzione
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onEnded={playNext} // Quando un brano finisce, chiama playNext (che ora gestisce lo shuffle)
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