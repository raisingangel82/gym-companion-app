import React, { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Search, Music2, CheckCircle, Youtube } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const MusicPage: React.FC = () => {
  const { videoId, setVideoId } = useMusic();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    try {
      const url = new URL(searchTerm);
      const videoIdFromUrl = url.searchParams.get('v');
      if (videoIdFromUrl) {
        setVideoId(videoIdFromUrl);
      } else {
        alert("URL di YouTube non valido.");
      }
    } catch (e) {
      setVideoId(searchTerm);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Music2 />
          <h2 className="text-2xl font-bold">Musica</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Incolla un link o un ID di un video di YouTube. La musica continuerà a suonare anche se cambi pagina.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ID o link video YouTube"
            className="flex-grow"
          />
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-grow">
              <Search size={16}/> Cerca
            </Button>
            {/* Pulsante per aprire YouTube in una nuova scheda */}
            <a 
              href="https://www.youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-grow"
            >
              <Button variant="outline" className="w-full">
                <Youtube size={16}/> Apri YouTube
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {videoId && (
        <Card className="flex items-center gap-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
          <CheckCircle />
          <div>
            <h3 className="font-bold">Player Attivo</h3>
            <p className="text-sm">Usa il pulsante centrale per Play/Pausa.</p>
          </div>
        </Card>
      )}
    </div>
  );
};