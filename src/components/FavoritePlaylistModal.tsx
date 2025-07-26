import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { useTheme } from '../contexts/ThemeContext';
import { Save } from 'lucide-react';

interface FavoritePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, url: string) => void;
}

export const FavoritePlaylistModal: React.FC<FavoritePlaylistModalProps> = ({ isOpen, onClose, onSave }) => {
  const { activeTheme } = useTheme();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim() || !url.trim()) {
      setError('Nome e URL non possono essere vuoti.');
      return;
    }
    // Semplice validazione per un link di playlist YouTube
    if (!url.includes('youtube.com/playlist?list=')) {
        setError('Inserisci un URL di playlist YouTube valido.');
        return;
    }
    setError('');
    onSave(name, url);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}><div className="fixed inset-0 bg-black/30 backdrop-blur-sm" /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}>
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100">
                  Aggiungi Playlist Preferita
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="playlist-name">Nome Playlist</Label>
                    <Input id="playlist-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Allenamento intenso" />
                  </div>
                  <div>
                    <Label htmlFor="playlist-url">URL Playlist YouTube</Label>
                    <Input id="playlist-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Incolla il link qui" />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="ghost" onClick={onClose} className="dark:text-gray-200">Annulla</Button>
                  <Button onClick={handleSave} className={`text-white ${activeTheme.bgClass} hover:opacity-90`}>
                    <Save size={16} className="mr-2" /> Salva
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};