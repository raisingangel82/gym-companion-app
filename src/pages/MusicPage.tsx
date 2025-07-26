import { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Music2, Youtube as YoutubeIcon, SkipBack, SkipForward, Upload, ListMusic, PlusCircle, ChevronDown, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FavoritePlaylistModal } from '../components/FavoritePlaylistModal';

const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [ /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/, ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) { return match[1]; }
    }
    if (url.length === 11 && !url.includes(' ')) { return url; }
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
  const { user, addFavoritePlaylist, removeFavoritePlaylist } = useAuth(); // Aggiunto removeFavoritePlaylist
  const [url, setUrl] = useState('');
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false); // Stato per la sezione "a soffietto"

  const handleUrlSubmit = () => {
    if (!url) return;
    const newPlaylistId = getYouTubePlaylistId(url);
    if (newPlaylistId) {
      playPlaylist(newPlaylistId);
      setUrl('');
      return;
    }
    const newVideoId = getYouTubeVideoId(url);
    if (newVideoId) {
      playTrack(newVideoId);
      setUrl('');
      return;
    }
    alert("URL non valido. Assicurati di inserire un link corretto di un video o di una playlist di YouTube.");
  };

  const handlePlayFavorite = (playlistUrl: string) => {
    const favoritePlaylistId = getYouTubePlaylistId(playlistUrl);
    if (favoritePlaylistId) {
      playPlaylist(favoritePlaylistId);
    }
  };

  const handleSaveFavorite = async (name: string, url: string) => {
    try {
      await addFavoritePlaylist({ name, url });
    } catch (error) {
      console.error("Errore nel salvataggio della playlist:", error);
      alert("Si è verificato un errore nel salvataggio.");
    }
  };

  const handleRemoveFavorite = async (playlist: {name: string, url: string}) => {
    if (window.confirm(`Sei sicuro di voler eliminare la playlist "${playlist.name}"?`)) {
        try {
            await removeFavoritePlaylist(playlist);
        } catch (error) {
            console.error("Errore durante l'eliminazione:", error);
            alert("Si è verificato un errore.");
        }
    }
  }

  const isMusicActive = !!currentTrack.id;
  const coverImageUrl = isMusicActive ? `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg` : '';

  return (
    <>
      {/* Contenitore principale per lo scroll, con padding in basso per far spazio ai controlli sticky */}
      <div className="container mx-auto p-4 space-y-6 pb-32">
        <Card className="w-full max-w-lg mx-auto flex flex-col justify-center overflow-hidden relative text-white bg-black min-h-[35vh]">
          {isMusicActive ? (
            <>
              <img src={coverImageUrl} alt="Copertina brano" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              <div className="relative z-10 flex flex-col h-full p-6 justify-center text-center">
                <h2 className="text-2xl font-bold text-shadow-lg">{currentTrack.title || 'Caricamento...'}</h2>
                <p className="text-sm opacity-80 text-shadow">{playlistId ? "Playlist" : "Brano Singolo"}</p>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-center p-6">
              <Music2 size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Player Musicale</h2>
              <p className="text-gray-500 dark:text-gray-400">Carica un link per iniziare.</p>
            </div>
          )}
        </Card>

        {/* MODIFICA: Card Playlist Preferite con layout a colonna */}
        <Card className="w-full max-w-lg mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Playlist Preferite</h2>
                <Button onClick={() => setIsFavoriteModalOpen(true)} size="icon" variant="ghost" className="text-gray-500 dark:text-gray-300">
                    <PlusCircle />
                </Button>
            </div>
            <div className="mt-2 space-y-2">
                {user?.favoritePlaylists && user.favoritePlaylists.length > 0 ? (
                    user.favoritePlaylists.map((playlist) => (
                        <div key={playlist.name} className="flex items-center gap-2">
                            <Button onClick={() => handlePlayFavorite(playlist.url)} variant="secondary" className="flex-grow justify-start text-left">
                                {playlist.name}
                            </Button>
                            <Button onClick={() => handleRemoveFavorite(playlist)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 flex-shrink-0">
                                <Trash2 size={16}/>
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Non hai ancora salvato nessuna playlist. Clicca su '+' per aggiungerne una.</p>
                )}
            </div>
        </Card>

        {/* MODIFICA: Card Carica Musica "a soffietto" */}
        <Card className="w-full max-w-lg mx-auto">
          <button onClick={() => setIsUploaderOpen(!isUploaderOpen)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload />
              <h2 className="text-xl font-bold">Carica Musica</h2>
            </div>
            <ChevronDown size={20} className={`transition-transform duration-300 ${isUploaderOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUploaderOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex gap-2">
                <Input value={url} onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()} onChange={(e) => setUrl(e.target.value)} placeholder="Link video o playlist" />
                <Button onClick={handleUrlSubmit} className={`text-white ${activeTheme.bgClass} hover:opacity-90`}>
                  Carica
                </Button>
              </div>
               <a href="http://googleusercontent.com/youtube.com/5" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full dark:border-red-500/50 dark:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                      <YoutubeIcon size={20} className="mr-2" /> Apri YouTube
                  </Button>
              </a>
            </div>
          )}
        </Card>
      </div>

      {/* MODIFICA: Controlli Playlist Fissi (Sticky) */}
      {playlistId && (
        <div className="fixed bottom-16 left-0 right-0 z-30">
            <div className="container mx-auto max-w-lg px-4">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2"><ListMusic size={16}/> Controlli</label>
                        <div className="flex items-center gap-2">
                            <Button onClick={previousTrack} variant="outline" size="icon"><SkipBack /></Button>
                            <Button onClick={nextTrack} variant="outline" size="icon"><SkipForward /></Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      )}

      <FavoritePlaylistModal
        isOpen={isFavoriteModalOpen}
        onClose={() => setIsFavoriteModalOpen(false)}
        onSave={handleSaveFavorite}
      />
    </>
  );
};