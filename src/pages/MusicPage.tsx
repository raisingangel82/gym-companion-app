// src/pages/MusicPage.tsx
import React, { useState } from 'react';
import YouTube from 'react-youtube';
import { useMusic } from '../contexts/MusicContext';
import { useTheme } from '../contexts/ThemeContext';
import { Music2, CheckCircle, Youtube as YoutubeIcon } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Funzione di utility per estrarre l'ID da qualsiasi link YouTube
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const MusicPage: React.FC = () => {
  const { videoId, setVideoId, decorativePlayerRef } = useMusic();
  const { activeTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSetVideo = () => {
    const extractedId = getYouTubeId(searchTerm);
    // Se l'ID è estratto dall'URL, usa quello, altrimenti usa l'input diretto
    setVideoId(extractedId || searchTerm);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center h-full gap-6">
      <Card className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-4"><Music2 /><h2 className="text-2xl font-bold">Musica</h2></div>
        <div className="flex gap-2">
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSetVideo()} placeholder="ID o link YouTube" className="flex-grow"/>
          <Button onClick={handleSetVideo}>Imposta</Button>
        </div>
      </Card>
      {videoId ? (
        <Card className="w-full max-w-lg">
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <YouTube 
              key={`decorative-${videoId}`}
              videoId={videoId}
              opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, controls: 0, mute: 1 } }}
              onReady={(event) => { decorativePlayerRef.current = event.target; }}
              className="w-full h-full"
            />
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400"><CheckCircle size={16} /><p className="text-sm font-semibold">Player Attivo</p></div>
            <Button onClick={() => setVideoId('')} variant="destructive" size="sm">Stop</Button>
          </div>
        </Card>
      ) : (
        <Card className="w-full max-w-lg p-0">
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" className={`w-full h-24 text-xl ${activeTheme.bgClass} text-white`}><YoutubeIcon size={28} className="mr-4" /> Apri YouTube</Button>
            </a>
        </Card>
      )}
    </div>
  );
};