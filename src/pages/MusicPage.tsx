import { useState, useRef, useEffect, useMemo, type ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic, type Song } from '../contexts/MusicPlayerContext';
import { Music2, UploadCloud, ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, RefreshCw, Trash2, X, Search } from 'lucide-react';
import { storage, db, auth } from '../services/firebase';
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; 
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getApp } from "firebase/app"; 
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// --- INTERFACCE E TIPI ---

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'uploading' | 'complete' | 'error';
}

interface DeezerSearchResult {
  id: number;
  title: string;
  artist: { name: string; };
  album: { cover_xl: string | null; };
}

interface ConfirmationMetadata {
  title: string;
  artist: string;
  coverURL: string | null;
}

// --- MODIFICA: Le interfacce dei props dei modali sono state spostate qui ---
interface SearchModalProps {
  step: 'input' | 'results';
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  results: DeezerSearchResult[];
  onSelect: (track: DeezerSearchResult) => void;
  onClose: () => void;
}

interface ConfirmModalProps {
  metadata: ConfirmationMetadata;
  onConfirm: (finalMetadata: ConfirmationMetadata) => void;
  onClose: () => void;
}
// --- FINE MODIFICA ---


// --- FUNZIONI HELPER ---

const sanitizeQuery = (title: string) => {
  let cleanedTitle = title.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
  cleanedTitle = cleanedTitle.replace(/\(.*?\)|\[.*?\]/g, '');
  const junkWords = ['official', 'lyric', 'video', 'audio', 'hd', 'hq', 'live', 'remastered', 'ft', 'feat', 'explicit'];
  const junkRegex = new RegExp(`\\b(${junkWords.join('|')})\\b`, 'gi');
  cleanedTitle = cleanedTitle.replace(junkRegex, '');
  cleanedTitle = cleanedTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  return cleanedTitle;
};

const searchTracksOnDeezer = async (query: string): Promise<DeezerSearchResult[] | null> => {
  const app = getApp();
  const functions = getFunctions(app, 'europe-west1');
  const getMusicMetadata = httpsCallable(functions, 'getMusicMetadata');
  try {
    const result = await getMusicMetadata({ query: query });
    const data = result.data as DeezerSearchResult[];
    return data.slice(0, 10);
  } catch (error) {
    console.error("Errore nella chiamata alla Cloud Function:", error);
    alert("Si è verificato un errore durante la ricerca. Controlla la console per i dettagli.");
    return null;
  }
};


// --- COMPONENTE PRINCIPALE ---

export const MusicPage: React.FC = () => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, isShuffleActive, loadPlaylistAndPlay, togglePlayPause, playNext, playPrevious, toggleShuffle } = useMusic();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<DeezerSearchResult[]>([]);
  const [songToUpdate, setSongToUpdate] = useState<Song | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalStep, setModalStep] = useState<'input' | 'results'>('input');
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<ConfirmationMetadata | null>(null);

  type SortOrder = 'uploadedAt_desc' | 'title_asc' | 'artist_asc';
  const [sortOrder, setSortOrder] = useState<SortOrder>('uploadedAt_desc');

  useEffect(() => {
    if (!user) return;
    const songsCollectionRef = collection(db, 'users', user.uid, 'songs');
    const q = query(songsCollectionRef, orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const songsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      setSongs(songsData);
    });
    return () => unsubscribe();
  }, [user]);

  const sortedSongs = useMemo(() => {
    const sortableSongs = [...songs];
    switch (sortOrder) {
      case 'title_asc':
        return sortableSongs.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist_asc':
        return sortableSongs.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'uploadedAt_desc':
      default:
        return songs;
    }
  }, [songs, sortOrder]);

  const handlePlaySong = (index: number) => {
    const songToPlay = sortedSongs[index];
    const originalPlaylistIndex = songs.findIndex(song => song.id === songToPlay.id);
    loadPlaylistAndPlay(songs, originalPlaylistIndex);
  };
  
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFilesToUpload(event.target.files);
    }
  };
  
  const handleUpload = async () => {
    const currentUser = auth.currentUser;
    if (!filesToUpload || filesToUpload.length === 0 || !currentUser) return;
  
    setIsUploading(true);
    const filesArray = Array.from(filesToUpload);
    setUploadProgress(filesArray.map(file => ({ fileName: file.name, progress: 0, status: 'pending' })));

    const uploadPromises = filesArray.map(file => {
      return new Promise<void>((resolve, reject) => {
        const storageRef = ref(storage, `music/${currentUser.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => prev.map(p => 
              p.fileName === file.name ? { ...p, status: 'uploading', progress: progress } : p
            ));
          }, 
          (error) => {
            console.error(`Errore nel processo di upload per ${file.name}:`, error);
            setUploadProgress(prev => prev.map(p => 
              p.fileName === file.name ? { ...p, status: 'error' } : p
            ));
            reject(error);
          }, 
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const initialData = {
              fileName: file.name,
              title: sanitizeQuery(file.name),
              artist: "Artista Sconosciuto",
              coverURL: null,
              downloadURL: downloadURL,
              uploadedAt: serverTimestamp(),
            };
            await addDoc(collection(db, 'users', currentUser.uid, 'songs'), initialData);
            setUploadProgress(prev => prev.map(p => 
              p.fileName === file.name ? { ...p, status: 'complete', progress: 100 } : p
            ));
            resolve();
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Uno o più upload sono falliti.", error);
    }

    setTimeout(() => {
      setIsUploading(false);
      setFilesToUpload(null);
      setUploadProgress([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 5000);
  };
  
  const handleOpenMetadataModal = (song: Song) => {
    setSongToUpdate(song);
    setSearchQuery(sanitizeQuery(song.title));
    setModalStep('input');
    setIsSearchModalOpen(true);
  };

  const handleExecuteSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    const results = await searchTracksOnDeezer(searchQuery);
    setIsSearching(false);
    if (results && results.length > 0) {
      setSearchResults(results);
      setModalStep('results');
    } else {
      alert(`Nessun risultato trovato per "${searchQuery}".`);
    }
  };

  const handleSelectMetadata = (deezerTrack: DeezerSearchResult) => {
    setSelectedMetadata({
      title: deezerTrack.title,
      artist: deezerTrack.artist.name,
      coverURL: deezerTrack.album.cover_xl,
    });
    setIsSearchModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async (finalMetadata: ConfirmationMetadata) => {
    if (!user || !songToUpdate) return;
    const songRef = doc(db, 'users', user.uid, 'songs', songToUpdate.id);
    try {
      await updateDoc(songRef, {
        title: finalMetadata.title,
        artist: finalMetadata.artist,
        coverURL: finalMetadata.coverURL,
      });
      alert(`Metadati per "${songToUpdate.title}" aggiornati con successo!`);
    } catch (error) {
      console.error("Errore durante l'aggiornamento del documento:", error);
    } finally {
      handleCloseConfirmModal();
    }
  };

  const handleDeleteSong = async (song: Song) => {
    if (!user) return;
    if (!window.confirm(`Sei sicuro di voler eliminare "${song.title}"? L'azione è irreversibile.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'songs', song.id));
      const audioFileRef = ref(storage, `music/${user.uid}/${song.fileName}`);
      await deleteObject(audioFileRef);
      alert(`"${song.title}" è stato eliminato con successo.`);
    } catch (error) {
      console.error("Errore durante l'eliminazione del brano:", error);
    }
  };
  
  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchResults([]);
    setSongToUpdate(null);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedMetadata(null);
    setSongToUpdate(null);
  };

  const getStatusText = (status: UploadProgress['status']) => {
    switch(status) {
      case 'processing': return 'Inizializzazione...';
      case 'uploading': return 'Caricamento...';
      case 'complete': return 'Completato!';
      case 'error': return 'Errore!';
      default: return 'In attesa...';
    }
  };

  return (
    <div className="container mx-auto px-4 pb-4 space-y-6">
      
      {currentTrack && (
        <Card className="w-full max-w-lg mx-auto p-4 space-y-4 sticky top-0 z-10 rounded-t-none rounded-b-lg">
          <div className="flex items-center gap-4">
            {currentTrack.coverURL ? (<img src={currentTrack.coverURL} alt={`Cover for ${currentTrack.title}`} className="w-24 h-24 rounded-md object-cover" />) : (<div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0"><Music2 size={48} className="text-gray-400 dark:text-gray-500" /></div>)}
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-lg truncate">{currentTrack.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={toggleShuffle} variant="ghost" size="icon" className={`w-12 h-12 ${isShuffleActive ? 'text-blue-500' : 'text-gray-500'}`}><Shuffle size={20} /></Button>
            <Button onClick={playPrevious} variant="ghost" size="icon" className="w-12 h-12"><SkipBack size={24} /></Button>
            <Button onClick={togglePlayPause} variant="default" size="icon" className="w-16 h-16 rounded-full">{isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}</Button>
            <Button onClick={playNext} variant="ghost" size="icon" className="w-12 h-12"><SkipForward size={24} /></Button>
            <div className="w-12 h-12" />
          </div>
        </Card>
      )}

      <div className="w-full max-w-lg mx-auto space-y-2">
        <div className="flex justify-between items-center px-2 pt-4">
          <h2 className="text-xl font-bold">La Mia Libreria</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={sortOrder === 'uploadedAt_desc' ? 'default' : 'ghost'} onClick={() => setSortOrder('uploadedAt_desc')}>Recenti</Button>
            <Button size="sm" variant={sortOrder === 'title_asc' ? 'default' : 'ghost'} onClick={() => setSortOrder('title_asc')}>Titolo</Button>
            <Button size="sm" variant={sortOrder === 'artist_asc' ? 'default' : 'ghost'} onClick={() => setSortOrder('artist_asc')}>Artista</Button>
          </div>
        </div>
        
        {sortedSongs.length > 0 ? (
          sortedSongs.map((song, index) => (
            <Card key={song.id} className="p-3 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4 flex-1 overflow-hidden cursor-pointer" onClick={() => handlePlaySong(index)}>
                {song.coverURL ? (<img src={song.coverURL} alt="" className="w-12 h-12 rounded-md object-cover" />) : (<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0"><Music2 size={24} className="text-gray-400" /></div>)}
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{song.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-500">
                <Button size="icon" variant="ghost" title="Cerca metadati online" onClick={(e) => { e.stopPropagation(); handleOpenMetadataModal(song); }}><RefreshCw size={18} /></Button>
                <Button size="icon" variant="ghost" title="Elimina brano" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteSong(song); }}><Trash2 size={18} /></Button>
                <Button size="icon" variant="ghost" title="Riproduci" onClick={(e) => { e.stopPropagation(); handlePlaySong(index); }}><Play size={20}/></Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-center text-gray-500 dark:text-gray-400"><p>Nessun brano trovato. Caricane uno per iniziare!</p></Card>
        )}
      </div>

      <Card className="w-full max-w-lg mx-auto">
        <button onClick={() => setIsUploaderOpen(!isUploaderOpen)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-2"><UploadCloud /><h2 className="text-xl font-bold">Carica Nuovi Brani</h2></div>
          <ChevronDown size={20} className={`transition-transform duration-300 ${isUploaderOpen ? 'rotate-180' : ''}`} />
        </button>
        {isUploaderOpen && (
          <div className="p-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <input type="file" accept="audio/*" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full" disabled={isUploading}>Scegli File...</Button>
            {filesToUpload && filesToUpload.length > 0 && (<div className='text-center text-sm text-gray-500 dark:text-gray-400'>{filesToUpload.length} brano(i) selezionato(i).</div>)}
            <Button onClick={handleUpload} className="w-full" disabled={isUploading || !filesToUpload}>{isUploading ? 'In corso...' : `Carica ${filesToUpload?.length || 0} brani`}</Button>
            {isUploading && uploadProgress.length > 0 && (
              <div className="space-y-3 pt-2">
                {uploadProgress.map(item => (
                  <div key={item.fileName}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <p className="font-medium truncate pr-2">{item.fileName}</p>
                      <p className="text-gray-500 dark:text-gray-400 flex-shrink-0">{getStatusText(item.status)}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className={`h-2.5 rounded-full transition-all duration-300 ${item.status === 'error' ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${item.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {isSearchModalOpen && (
        <MetadataSearchModal 
          step={modalStep}
          query={searchQuery}
          setQuery={setSearchQuery}
          onSearch={handleExecuteSearch}
          isSearching={isSearching}
          results={searchResults} 
          onSelect={handleSelectMetadata}
          onClose={handleCloseSearchModal}
        />
      )}
      
      {isConfirmModalOpen && selectedMetadata && (
        <ConfirmMetadataModal
          metadata={selectedMetadata}
          onConfirm={handleConfirmUpdate}
          onClose={handleCloseConfirmModal}
        />
      )}
    </div>
  );
};


// --- COMPONENTI MODALI ---
const MetadataSearchModal = ({ step, query, setQuery, onSearch, isSearching, results, onSelect, onClose }: SearchModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-lg">{step === 'input' ? 'Modifica la Ricerca' : 'Seleziona il Metadato'}</h3>
          <Button size="icon" variant="ghost" onClick={onClose}><X size={20}/></Button>
        </div>
        {step === 'input' ? (
          <div className="p-6 space-y-4">
            <label htmlFor="search-query" className="text-sm font-medium text-gray-700 dark:text-gray-300">Inserisci i termini di ricerca</label>
            <input id="search-query" type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" placeholder="Es. Queen Bohemian Rhapsody" />
            <Button onClick={onSearch} className="w-full" disabled={isSearching}>
              {isSearching ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>) : (<div className="flex items-center justify-center gap-2"><Search size={18} /> Cerca</div>)}
            </Button>
          </div>
        ) : (
          <div className="overflow-y-auto">
            {results.map(track => (
              <div key={track.id} className="p-3 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onSelect(track)}>
                <img src={track.album.cover_xl || undefined} alt={`Cover for ${track.title}`} className="w-14 h-14 rounded-md object-cover bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{track.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{track.artist.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ConfirmMetadataModal = ({ metadata, onConfirm, onClose }: ConfirmModalProps) => {
  const [title, setTitle] = useState(metadata.title);
  const [artist, setArtist] = useState(metadata.artist);

  const handleConfirmClick = () => {
    onConfirm({ title, artist, coverURL: metadata.coverURL });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg">Conferma Metadati</h3>
          <Button size="icon" variant="ghost" onClick={onClose}><X size={20}/></Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <img src={metadata.coverURL || undefined} alt="Cover" className="w-32 h-32 rounded-md object-cover bg-gray-200 dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="title-confirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">Titolo</label>
            <input id="title-confirm" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="artist-confirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">Artista</label>
            <input id="artist-confirm" type="text" value={artist} onChange={(e) => setArtist(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button variant="default" onClick={handleConfirmClick}>Salva Modifiche</Button>
        </div>
      </div>
    </div>
  );
};