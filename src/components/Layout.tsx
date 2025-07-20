// src/components/Layout.tsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import YouTube from 'react-youtube';
import { Search, Plus, Play, Pause, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { Header } from './Header';
import { BottomBar } from './BottomBar';
import { WorkoutEditorModal } from './WorkoutEditorModal';
import { addWorkout } from '../services/firestore';

export const Layout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const { videoUrl, isPlaying, togglePlayPause, playerRef, playVideo } = useMusic();
  const [isWorkoutEditorOpen, setWorkoutEditorOpen] = useState(false);

  const getActionConfig = () => {
    switch (location.pathname) {
      case '/':
        return { icon: isPlaying ? Pause : Play, onClick: togglePlayPause, label: 'Musica' };
      case '/settings':
        return { icon: Plus, onClick: () => setWorkoutEditorOpen(true), label: 'Crea Scheda' };
      case '/music':
        return { icon: Search, onClick: () => window.open('https://youtube.com', '_blank'), label: 'Cerca Musica' };
      default:
        return { icon: Music, onClick: () => playVideo('https://www.youtube.com/watch?v=jfKfPfyJRdk'), label: 'Musica' };
    }
  };

  const handleSaveNewWorkout = async (data: any) => {
    try {
      await addWorkout({ ...data, createdAt: new Date(), history: [] });
      setWorkoutEditorOpen(false);
    } catch (error) {
      console.error("Errore nel salvataggio della nuova scheda:", error);
      alert("Impossibile salvare la scheda.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {videoUrl && (
         <div className="absolute -left-[9999px] -top-[9999px]">
            <YouTube
                videoId={videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}
                onReady={(event) => (playerRef.current = event.target)}
                opts={{ playerVars: { autoplay: 1 } }}
            />
         </div>
      )}
      <Header onLogout={logout} />
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomBar actionConfig={getActionConfig()} />
      <WorkoutEditorModal
        isOpen={isWorkoutEditorOpen}
        onClose={() => setWorkoutEditorOpen(false)}
        onSave={handleSaveNewWorkout}
        workout={null}
      />
    </div>
  );
};
