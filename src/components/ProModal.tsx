// src/components/ProModal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
import { BaseModal } from './ui/BaseModal';
import { Button } from './ui/Button';
import { useTheme } from '../contexts/ThemeContext';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose, featureName }) => {
  const { activeTheme } = useTheme();
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Funzionalità Pro">
      <div className="text-center p-4">
        <Sparkles className={`mx-auto h-12 w-12 ${activeTheme.text}`} />
        <h3 className="mt-4 text-xl font-bold">Sblocca {featureName}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Questa è una delle tante potenti funzionalità disponibili nel piano Pro.
        </p>
        <Link to="/upgrade">
          <Button className={`mt-6 w-full text-white ${activeTheme.bg}`}>
            <Star size={16} /> Passa a Pro
          </Button>
        </Link>
      </div>
    </BaseModal>
  );
};
