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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const loadPlaylistAndPlay = useCallback((newPlaylist: Song[], startIndex: number) => {
    setPlaylist(newPlaylist);
    setCurrentTrackIndex(startIndex);
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length > 0 && currentTrackIndex !== null) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
    }
  }, [playlist, currentTrackIndex]);
  
  const playPrevious = useCallback(() => {
    if (playlist.length > 0 && currentTrackIndex !== null) {
      const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      setCurrentTrackIndex(prevIndex);
    }
  }, [playlist, currentTrackIndex]);

  const togglePlayPause = useCallback(() => {
    if (currentTrack) {
      setIsPlaying(prev => !prev);
    }
  }, [currentTrack]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack && audio.src !== currentTrack.downloadURL) {
      audio.src = currentTrack.downloadURL;
      setIsPlaying(true);
    }

    if (isPlaying) {
      audio.play().catch(e => console.error("Errore di riproduzione:", e));
    } else {
      audio.pause();
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