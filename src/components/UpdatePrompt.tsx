import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/Button';
import { RefreshCw } from 'lucide-react';

export const UpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrato:', r);
    },
    onRegisterError(error) {
      console.error('Errore registrazione Service Worker:', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <p className="font-bold text-gray-900 dark:text-gray-100">Nuova versione disponibile!</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ricarica per applicare l'aggiornamento.</p>
        </div>
        <Button onClick={() => updateServiceWorker(true)}>
          <RefreshCw size={16} className="mr-2"/>
          Aggiorna
        </Button>
      </div>
    </div>
  );
};