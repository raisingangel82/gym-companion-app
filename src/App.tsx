import React, { useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import YouTube from 'react-youtube';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { MusicProvider, useMusic } from './contexts/MusicContext';
import { PageActionProvider, usePageAction } from './contexts/PageActionContext';
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { ManagePage } from './pages/ManagePage';
import { WorkoutPage } from './pages/WorkoutPage';
import { StatsPage } from './pages/StatsPage';
import { MusicPage } from './pages/MusicPage';
import { Play, Pause, Dumbbell, Plus, Sparkles } from 'lucide-react'; // Aggiunta icona Sparkles
import type { ActionConfig } from './types/actions';

function AppContent() {
  const { isPlaying, setIsPlaying, videoId, playerRef, decorativePlayerRef } = useMusic();
  const { registeredAction } = usePageAction();
  const location = useLocation();

  const handleTogglePlay = () => {
    const mainPlayer = playerRef.current;
    const decorativePlayer = decorativePlayerRef.current;
    if (!mainPlayer) return;
    if (isPlaying) {
      mainPlayer.pauseVideo();
      if (decorativePlayer) decorativePlayer.pauseVideo();
    } else {
      mainPlayer.playVideo();
      if (decorativePlayer) decorativePlayer.playVideo();
    }
  };
  
  const actionConfig: ActionConfig = useMemo(() => {
    // Logica per la pagina di allenamento
    if (location.pathname === '/') {
      return { icon: Dumbbell, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Registra Set', disabled: !registeredAction };
    }
    
    // Logica per la pagina di gestione
    if (location.pathname === '/manage') {
      return { icon: Plus, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Crea Scheda', disabled: !registeredAction };
    }

    // NUOVA Logica per la pagina delle statistiche
    if (location.pathname === '/stats') {
        return { icon: Sparkles, onClick: () => { if (registeredAction) registeredAction(); }, label: 'Report AI', disabled: !registeredAction };
    }
    
    // Logica di fallback per la musica
    return { icon: isPlaying ? Pause : Play, onClick: handleTogglePlay, label: 'Play/Pausa', disabled: !videoId };
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
      <svg style={{ position: 'absolute', height: 0, width: 0 }}><defs><filter id="remove-white-bg-filter"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 -255 -255 -255 0 255" result="mask"/><feComposite in="SourceGraphic" in2="mask" operator="out" /></filter></defs></svg>
      {videoId && ( <div style={{ position: 'absolute', top: -9999, left: -9999 }}><YouTube key={`main-${videoId}`} videoId={videoId} opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }} onReady={(event) => { playerRef.current = event.target; }} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnd={() => setIsPlaying(false)} /></div> )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <MusicProvider>
          <PageActionProvider>
            <AppContent />
          </PageActionProvider>
        </MusicProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;