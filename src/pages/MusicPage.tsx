import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic, Song } from '../contexts/MusicPlayerContext';
import { Music2, UploadCloud, ChevronDown, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// Import da Firebase (assicurati che i percorsi siano corretti)
import { storage, db } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy } from 'firebase/firestore';

// Import dei componenti UI
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface UploadProgress {
  fileName: string;
  progress: number;
}

export const MusicPage: React.FC = () => {
  const { user } = useAuth();
  // Prendiamo tutto il necessario dal MusicContext per controllare il player
  const { 
    currentTrack, 
    isPlaying, 
    loadPlaylistAndPlay, 
    togglePlayPause,
    playNext,
    playPrevious
  } = useMusic();

  // Stato per la lista di brani caricati da Firestore
  const [songs, setSongs] = useState<Song[]>([]);
  
  // Stati per la gestione dell'uploader
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Questo useEffect si attiva al caricamento della pagina e recupera i brani
  useEffect(() => {
    if (!user) return; // Non fare nulla se l'utente non è loggato

    // Puntiamo alla sottocollezione 'songs' dell'utente corrente
    const songsCollectionRef = collection(db, 'users', user.uid, 'songs');
    const q = query(songsCollectionRef, orderBy('uploadedAt', 'desc'));

    // 'onSnapshot' crea un listener in tempo reale: la lista si aggiornerà
    // automaticamente se aggiungi o rimuovi brani.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const songsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      setSongs(songsData);
    });

    // Questa funzione di pulizia rimuove il listener quando esci dalla pagina
    return () => unsubscribe();
  }, [user]);

  // Funzione per avviare la riproduzione quando si clicca un brano dalla lista
  const handlePlaySong = (index: number) => {
    loadPlaylistAndPlay(songs, index);
  };
  
  // Funzione di upload (invariata)
  const handleUpload = async () => {
    if (!filesToUpload || filesToUpload.length === 0 || !user) {
      alert("Seleziona almeno un file da caricare.");
      return;
    }

    setIsUploading(true);
    const filesArray = Array.from(filesToUpload);
    setUploadProgress(filesArray.map(file => ({ fileName: file.name, progress: 0 })));

    const uploadPromises = filesArray.map(async (file) => {
      const storageRef = ref(storage, `music/${user.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => 
              prev.map(item => 
                item.fileName === file.name ? { ...item, progress: progress } : item
              )
            );
          },
          (error) => {
            console.error(`Upload fallito per ${file.name}:`, error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            try {
              const songsCollectionRef = collection(db, 'users', user.uid, 'songs');
              await addDoc(songsCollectionRef, {
                fileName: file.name,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Artista Sconosciuto",
                downloadURL: downloadURL,
                uploadedAt: serverTimestamp()
              });
            } catch (error) {
              console.error("Errore nel salvataggio su Firestore:", error);
            }
            resolve();
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      alert("Tutti i brani sono stati caricati e registrati con successo!");
    } catch (error) {
      alert("Si è verificato un errore durante il caricamento di alcuni brani.");
    } finally {
      setIsUploading(false);
      setFilesToUpload(null);
      setUploadProgress([]);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFilesToUpload(event.target.files);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 pb-32">
      
      {/* ========================================================== */}
      {/* NUOVO PLAYER CARD - VISIBILE SOLO DURANTE LA RIPRODUZIONE   */}
      {/* ========================================================== */}
      {currentTrack && (
        <Card className="w-full max-w-lg mx-auto p-4 space-y-4 sticky top-4 z-10">
          <div className="flex items-center gap-4">
            {/* Placeholder per la copertina dell'album (Fase 2) */}
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
              <Music2 size={48} className="text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-lg truncate">{currentTrack.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>
          {/* Controlli di riproduzione */}
          <div className="flex items-center justify-center gap-4">
            <Button onClick={playPrevious} variant="ghost" size="icon" className="w-12 h-12">
              <SkipBack size={24} />
            </Button>
            <Button onClick={togglePlayPause} variant="default" size="icon" className="w-16 h-16 rounded-full">
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </Button>
            <Button onClick={playNext} variant="ghost" size="icon" className="w-12 h-12">
              <SkipForward size={24} />
            </Button>
          </div>
        </Card>
      )}

      {/* LISTA DEI BRANI CARICATI */}
      <div className="w-full max-w-lg mx-auto space-y-2">
        <h2 className="text-xl font-bold px-2 pt-4">La Mia Libreria</h2>
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <Card key={song.id} className="p-3 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => handlePlaySong(index)}>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{song.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
              </div>
              <Button size="icon" variant="ghost">
                <Play />
              </Button>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p>Nessun brano trovato. Caricane uno per iniziare!</p>
          </Card>
        )}
      </div>

      {/* Card per l'upload */}
      <Card className="w-full max-w-lg mx-auto">
        <button onClick={() => setIsUploaderOpen(!isUploaderOpen)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud />
            <h2 className="text-xl font-bold">Carica Nuovi Brani</h2>
          </div>
          <ChevronDown size={20} className={`transition-transform duration-300 ${isUploaderOpen ? 'rotate-180' : ''}`} />
        </button>
        {isUploaderOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <input type="file" accept="audio/*" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full" disabled={isUploading}>
              Scegli File Audio...
            </Button>
            {filesToUpload && filesToUpload.length > 0 && (
              <div className='text-center text-sm text-gray-500 dark:text-gray-400'>
                {filesToUpload.length} brano(i) selezionato(i).
              </div>
            )}
            <Button onClick={handleUpload} className="w-full" disabled={isUploading || !filesToUpload}>
              {isUploading ? 'Caricamento in corso...' : `Carica ${filesToUpload?.length || 0} brani`}
            </Button>
            {isUploading && uploadProgress.length > 0 && (
              <div className="space-y-2 pt-2">
                {uploadProgress.map(item => (
                  <div key={item.fileName}>
                    <p className="text-sm truncate">{item.fileName}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.progress.toFixed(2)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};