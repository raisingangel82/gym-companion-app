import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from 'react';

// Interfacce per l'API del Player di YouTube
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  getPlayerState: () => number;
  getVideoData: () => { title: string; video_id: string };
  loadVideoById: (videoId: string) => void;
  loadPlaylist: (playlistOptions: { list: string; listType: 'playlist' }) => void;
}
interface PlayerEvent { 
  target: YouTubePlayer; 
  data: number; 
}

// Tipi per la libreria RND - CORREZIONE: usiamo solo number
type Position = { x: number; y: number };
type Size = { width: number; height: number };

interface MusicContextType {
  videoId: string | null;
  playlistId: string | null;
  currentTrack: { id: string | null; title: string | null };
  playTrack: (id: string) => void;
  playPlaylist: (id:string) => void;
  stopMusic: () => void;
  isPlaying: boolean;
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
  nextTrack: () => void;
  previousTrack: () => void;
  handlePlayerStateChange: (event: PlayerEvent) => void;
  handlePlayerError: (event: { data: number }) => void;
  
  isPlayerMaximized: boolean;
  setPlayerMaximized: (isMaximized: boolean) => void;
  playerPosition: Position;
  setPlayerPosition: (position: Position) => void;
  playerSize: Size;
  setPlayerSize: (size: Size) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const defaultMiniPlayerSize: Size = { width: 240, height: 135 };
const defaultMiniPlayerPosition: Position = { x: window.innerWidth - 260, y: window.innerHeight - 215 };

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{ id: string | null; title: string | null }>({ id: null, title: null });
  const playerRef = useRef<YouTubePlayer | null>(null);
  
  const [isPlayerMaximized, setPlayerMaximized] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<Position>(defaultMiniPlayerPosition);
  const [playerSize, setPlayerSize] = useState<Size>(defaultMiniPlayerSize);

  const playTrack = useCallback((id: string) => {
    if (playerRef.current) playerRef.current.loadVideoById(id);
    setVideoId(id);
    setPlaylistId(null);
  }, []);

  const playPlaylist = useCallback((id: string) => {
    if (playerRef.current) playerRef.current.loadPlaylist({ list: id, listType: 'playlist' });
    setVideoId(null);
    setPlaylistId(id);
  }, []);
  
  const stopMusic = useCallback(() => {
    playerRef.current?.stopVideo();
    setVideoId(null);
    setPlaylistId(null);
    setCurrentTrack({ id: null, title: null });
  }, []);

  const nextTrack = useCallback(() => { playerRef.current?.nextVideo(); }, []);
  const previousTrack = useCallback(() => { playerRef.current?.previousVideo(); }, []);

  const handlePlayerError = useCallback((event: { data: number }) => {
    console.error(`Youtubeer Error Code: ${event.data}`);
    if (playlistId) nextTrack();
    else stopMusic();
  }, [playlistId, nextTrack, stopMusic]);

  const handlePlayerStateChange = useCallback((event: PlayerEvent) => {
    const playerState = event.data;
    if (playerState === 1) { // Playing
      const trackData = event.target.getVideoData();
      if (trackData.video_id) setCurrentTrack({ id: trackData.video_id, title: trackData.title });
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, []);

  const value = { 
    videoId, playlistId, currentTrack, playTrack, playPlaylist, stopMusic,
    isPlaying, playerRef, nextTrack, previousTrack,
    handlePlayerStateChange, handlePlayerError,
    isPlayerMaximized, setPlayerMaximized, playerPosition, setPlayerPosition,
    playerSize, setPlayerSize
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};