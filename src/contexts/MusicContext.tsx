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
    setPlaylistId(null);
    setVideoId(id);
    setIsPlaying(true);
  };

  const playPlaylist = (id: string) => {
    setVideoId(null);
    setPlaylistId(id);
    setIsPlaying(true);
  };
  
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