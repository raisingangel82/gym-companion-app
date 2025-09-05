import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic, type Song } from '../contexts/MusicPlayerContext';
import { Music2, UploadCloud, ChevronDown, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { storage, db } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import jsmediatags from 'jsmediatags';

// Definizione del tipo locale per i tag multimediali
interface MediaTagPicture {
  data: number[];
  format: string;
}
interface MediaTags {
  title?: string;
  artist?: string;
  picture?: MediaTagPicture;
}
interface CustomTagType {
  tags: MediaTags;
}

// Interfaccia per lo stato di avanzamento dell'upload
interface UploadProgress {
  fileName: string;
  progress: number;
}

// Funzione helper che utilizza il nostro tipo locale
const readMediaTags = (file: File): Promise<CustomTagType> => {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => resolve(tag as CustomTagType),
      onError: (error) => reject(error),
    });
  });
};

export const MusicPage: React.FC = () => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, loadPlaylistAndPlay, togglePlayPause, playNext, playPrevious } = useMusic();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePlaySong = (index: number) => {
    loadPlaylistAndPlay(songs, index);
  };
  
  const handleUpload = async () => {
    if (!filesToUpload || filesToUpload.length === 0 || !user) return;

    setIsUploading(true);
    const filesArray = Array.from(filesToUpload);
    setUploadProgress(filesArray.map(file => ({ fileName: file.name, progress: 0 })));

    const uploadPromises = filesArray.map(async (file) => {
      let metadata = { title: file.name.replace(/\.[^/.]+$/, ""), artist: "Artista Sconosciuto", coverURL: null as string | null };
      try {
        const tags = await readMediaTags(file);
        if (tags.tags.title) metadata.title = tags.tags.title;
        if (tags.tags.artist) metadata.artist = tags.tags.artist;

        const { picture } = tags.tags;
        if (picture) {
          const { data, format } = picture;
          const blob = new Blob([new Uint8Array(data)], { type: format });
          const coverRef = ref(storage, `covers/${user.uid}/${metadata.title}-cover.jpg`);
          await uploadBytes(coverRef, blob);
          metadata.coverURL = await getDownloadURL(coverRef);
        }
      } catch (error) {
        console.warn(`Could not read metadata for ${file.name}`, error);
      }

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
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            try {
              const songsCollectionRef = collection(db, 'users', user.uid, 'songs');
              await addDoc(songsCollectionRef, {
                fileName: file.name,
                title: metadata.title,
                artist: metadata.artist,
                coverURL: metadata.coverURL,
                downloadURL: downloadURL,
                uploadedAt: serverTimestamp()
              });
            } catch (error) {
              console.error("Error saving to Firestore:", error);
            }
            resolve();
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      alert("Upload complete!");
    } catch (error) {
      alert("An error occurred during upload.");
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
      
      {currentTrack && (
        <Card className="w-full max-w-lg mx-auto p-4 space-y-4 sticky top-4 z-10">
          <div className="flex items-center gap-4">
            {currentTrack.coverURL ? (
              <img src={currentTrack.coverURL} alt={`Cover for ${currentTrack.title}`} className="w-24 h-24 rounded-md object-cover" />
            ) : (
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                <Music2 size={48} className="text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-lg truncate">{currentTrack.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>
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

      <div className="w-full max-w-lg mx-auto space-y-2">
        <h2 className="text-xl font-bold px-2 pt-4">La Mia Libreria</h2>
        {songs.map((song, index) => (
          <Card key={song.id} className="p-3 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => handlePlaySong(index)}>
            {song.coverURL ? (
              <img src={song.coverURL} alt="" className="w-12 h-12 rounded-md object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                <Music2 size={24} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">{song.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
            </div>
            <Button size="icon" variant="ghost">
              <Play />
            </Button>
          </Card>
        ))}
      </div>

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
              {isUploading ? 'Caricamento...' : `Carica ${filesToUpload?.length || 0} brani`}
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