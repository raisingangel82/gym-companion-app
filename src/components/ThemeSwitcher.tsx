// src/components/ThemeSwitcher.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  // Ottiene il tema corrente e la funzione per cambiarlo dal nostro contesto
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
      aria-label="Toggle theme"
    >
      {/* Se il tema è 'light', mostra l'icona della Luna. Altrimenti, mostra il Sole. */}
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};
