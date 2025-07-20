// src/pages/MusicPage.tsx
import React, { useState } from 'react';
import { Music, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ProModal } from '../components/ProModal';

export const MusicPage: React.FC = () => {
  const { videoUrl, playVideo } = useMusic();
  const { activeTheme } = useTheme();
  const [linkInput, setLinkInput] = useState('');
  const [proModalOpen, setProModalOpen] = useState(false);

  const handlePlayFromLink = () => {
    if (linkInput.includes('youtube.com') || linkInput.includes('youtu.be')) {
      playVideo(linkInput);
      setLinkInput('');
    } else {
      alert("Per favore, inserisci un link valido di YouTube.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Musica</h1>
        <p className="text-gray-500 dark:text-gray-400">Incolla un link di YouTube per la riproduzione continua.</p>
      </header>

      <Card>
        <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
          {videoUrl ? (
             <div className="w-full h-full bg-black flex items-center justify-center text-white text-center p-4">
                <div>
                    <Music size={48} className="mx-auto" />
                    <p className="mt-4 font-semibold">Riproduzione in corso...</p>
                    <p className="text-sm text-gray-400">Usa il controller nella barra di navigazione per Play/Pausa.</p>
                </div>
             </div>
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-center">
              <Music size={48} />
              <p className="mt-2">Nessun video in riproduzione</p>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Incolla un link di YouTube qui..."
            className="flex-grow"
          />
          <Button onClick={handlePlayFromLink} className={`text-white ${activeTheme.bg}`}>
            <LinkIcon size={20} /> Avvia
          </Button>
        </div>
        
        <Button onClick={() => setProModalOpen(true)} variant="secondary" className="w-full">
          <Sparkles size={16} /> Suggerimento AI
        </Button>
      </div>

      <ProModal 
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName="Suggerimenti Musicali"
      />
    </div>
  );
};
