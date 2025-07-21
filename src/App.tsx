import React, { useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import YouTube from 'react-youtube';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { MusicProvider, useMusic } from './contexts/MusicContext';
import { WorkoutActionProvider, useWorkoutAction } from './contexts/WorkoutActionContext'; // Importato
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { ManagePage } from './pages/ManagePage';
import { WorkoutPage } from './pages/WorkoutPage';
import { StatsPage } from './pages/StatsPage';
import { MusicPage } from './pages/MusicPage';
import { Play, Pause, Dumbbell } from 'lucide-react';
import type { ActionConfig } from './types/actions';

function AppContent() {
  const { isPlaying, setIsPlaying, videoId, playerRef } = useMusic();
  const { registeredAction } = useWorkoutAction(); // Usiamo il nuovo contesto
  const location = useLocation();

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };
  
  const actionConfig: ActionConfig = useMemo(() => {
    if (location.pathname === '/') {
      return {
        icon: Dumbbell,
        onClick: () => {
          // Esegue l'azione registrata dalla WorkoutPage, se esiste.
          if (registeredAction) registeredAction();
        },
        label: 'Registra Set',
        // Il pulsante è disabilitato se non c'è un'azione registrata.
        disabled: !registeredAction,
      };
    }

    return {
      icon: isPlaying ? Pause : Play,
      onClick: handleTogglePlay,
      label: isPlaying ? 'Pausa' : 'Play',
      disabled: !videoId,
    };
  }, [location.pathname, isPlaying, videoId, registeredAction]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-16">
        <Routes>
          <Route path="/" element={<WorkoutPage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/music" element={<MusicPage />} />
        </Routes>
      </main>
      <BottomBar actionConfig={actionConfig} />

      {videoId && (
        <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
          <YouTube
            videoId={videoId}
            opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
            onReady={(event) => { playerRef.current = event.target; }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnd={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <MusicProvider>
          <WorkoutActionProvider> {/* Avvolgiamo AppContent con il nuovo provider */}
            <AppContent />
          </WorkoutActionProvider>
        </MusicProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;