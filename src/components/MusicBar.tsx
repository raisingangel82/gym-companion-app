import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import YouTube from 'react-youtube'; // <-- Importiamo YouTube
import { useMusic } from '../contexts/MusicContext';
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { Button } from './ui/Button';

export const MusicBar: React.FC = () => {
  const { 
    videoId,
    playlistId,
    currentTrack, 
    isPlaying, 
    playerRef, 
    handlePlayerStateChange,
    handlePlayerError,
    nextTrack, 
    previousTrack,
    playTrack,
    playPlaylist 
  } = useMusic();

  const handleTogglePlay = useCallback(() => {
    if (!playerRef.current) return;
    const playerState = playerRef.current.getPlayerState();
    if (playerState === 1) { // 1 = playing
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [playerRef]);

  const isMusicPlaying = !!(videoId || playlistId);

  // Se non c'è musica, il componente non renderizza nulla.
  if (!isMusicPlaying) {
    return null;
  }
  
  const playerOptions = {
    height: '100%',
    width: '100%',
    playerVars: { 
      autoplay: 1 as const,
      controls: 0, // Nascondiamo i controlli nativi per coerenza
      modestbranding: 1,
    } 
  };

  return (
    <div className="flex-shrink-0 h-16 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 sm:px-4 gap-2">
      
      {/* L'UNICA ISTANZA DEL PLAYER ORA VIVE QUI DENTRO */}
      <div className="w-24 h-full flex-shrink-0 bg-black rounded-md overflow-hidden">
        <YouTube
            opts={playerOptions}
            onReady={(event) => { 
                playerRef.current = event.target;
                if (playlistId) playPlaylist(playlistId);
                else if (videoId) playTrack(videoId);
            }}
            onStateChange={handlePlayerStateChange}
            onError={handlePlayerError}
            className="youtube-container"
        />
      </div>

      {/* Info traccia (cliccabile) */}
      <Link to="/music" className="flex-1 text-left overflow-hidden cursor-pointer">
        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
          {currentTrack.title || 'Nessuna traccia'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tocca per gestire playlist e coda
        </p>
      </Link>
      
      {/* Controlli di riproduzione */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button onClick={previousTrack} variant="ghost" size="icon" disabled={!playlistId}>
          <SkipBack size={20} />
        </Button>
        <Button onClick={handleTogglePlay} variant="ghost" size="icon">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        <Button onClick={nextTrack} variant="ghost" size="icon" disabled={!playlistId}>
          <SkipForward size={20} />
        </Button>
      </div>
    </div>
  );
};