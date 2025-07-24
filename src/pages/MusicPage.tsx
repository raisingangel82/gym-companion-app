import { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { useTheme } from '../contexts/ThemeContext';
import { Music2, Youtube as YoutubeIcon, SkipBack, SkipForward, Upload, ListMusic } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    if (url.length === 11 && !url.includes(' ')) {
        return url;
    }
    return null;
};

const getYouTubePlaylistId = (url: string): string | null => {
  const regExp = /[&?]list=([^&]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const MusicPage: React.FC = () => {
  const { currentTrack, playlistId, playTrack, playPlaylist, nextTrack, previousTrack } = useMusic();
  const { activeTheme } = useTheme();
  const [url, setUrl] = useState('');

  const handleUrlSubmit = () => {
    if (!url) return;
    const playlistId = getYouTubePlaylistId(url);
    if (playlistId) {
      playPlaylist(playlistId);
      setUrl('');
      return;
    }
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      playTrack(videoId);
      setUrl('');
      return;
    }
    alert("URL non valido. Assicurati di inserire un link corretto di un video o di una playlist di YouTube.");
  };

  const isMusicActive = !!currentTrack.id;
  const coverImageUrl = isMusicActive ? `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg` : '';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="w-full max-w-lg mx-auto flex flex-col justify-center overflow-hidden relative text-white dark:bg-black min-h-[400px]">
        {isMusicActive ? (
          <>
            <img src={coverImageUrl} alt="Copertina brano" className="absolute inset-0 w-full h-full object-fill" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            <div className="relative z-10 flex flex-col h-full p-6 justify-center text-center">
              <h2 className="text-2xl font-bold text-shadow-lg">{currentTrack.title || 'Caricamento...'}</h2>
              <p className="text-sm opacity-80 text-shadow">{playlistId ? "Playlist" : "Brano Singolo"}</p>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-center p-6">
              <Music2 size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Player Musicale</h2>
              <p className="text-gray-500 dark:text-gray-400">Incolla un link qui sotto per iniziare.</p>
            </div>
          </>
        )}
      </Card>

      <Card className="w-full max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Upload />
          <h2 className="text-xl font-bold">Carica Musica</h2>
        </div>
        <div className="flex gap-2">
          <Input value={url} onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()} onChange={(e) => setUrl(e.target.value)} placeholder="Link video o playlist" />
          <Button onClick={handleUrlSubmit}>Carica</Button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
           <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="block">
              <Button className={`w-full text-white ${activeTheme.bgClass} hover:opacity-90`}>
                  <YoutubeIcon size={20} className="mr-2" /> Apri YouTube
              </Button>
          </a>
        </div>
        
        {playlistId && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2"><ListMusic size={16}/> Controlli Playlist</label>
                    <div className="flex items-center gap-2">
                        <Button onClick={previousTrack} variant="outline" size="icon"><SkipBack /></Button>
                        <Button onClick={nextTrack} variant="outline" size="icon"><SkipForward /></Button>
                    </div>
                </div>
            </div>
        )}
      </Card>
    </div>
  );
};