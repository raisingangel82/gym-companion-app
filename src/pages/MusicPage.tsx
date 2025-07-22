import React, { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { useTheme } from '../contexts/ThemeContext';
import { Music2, CheckCircle, Youtube as YoutubeIcon } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url; // Ritorna l'input se non è un URL valido
};

export const MusicPage: React.FC = () => {
  const { videoId, setVideoId } = useMusic();
  const { activeTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSetVideo = () => {
    const extractedId = getYouTubeId(searchTerm);
    if (extractedId) {
      setVideoId(extractedId);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center h-full gap-6">
      <Card className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <Music2 />
          <h2 className="text-2xl font-bold">Musica</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Incolla un link o un ID di YouTube. L'audio continuerà in background.
        </p>
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetVideo()}
            placeholder="ID o link YouTube"
            className="flex-grow"
          />
          <Button onClick={handleSetVideo}>Imposta</Button>
        </div>
      </Card>

      {videoId ? (
        <Card className="w-full max-w-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle />
                <div>
                    <h3 className="font-bold">Player Attivo</h3>
                    <p className="text-sm">Controlla la musica dal pulsante centrale.</p>
                </div>
            </div>
            <Button onClick={() => setVideoId('')} variant="destructive" size="sm">
              Stop
            </Button>
          </div>
        </Card>
      ) : (
         <Card className="w-full max-w-lg p-0">
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" className={`w-full h-24 text-xl ${activeTheme.bgClass} text-white`}>
                    <YoutubeIcon size={28} className="mr-4" /> Apri YouTube
                </Button>
            </a>
        </Card>
      )}
    </div>
  );
};