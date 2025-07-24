import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Star, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { AccountIcon } from './AccountIcon';

interface HeaderProps {
  onLogout: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onOpenOnboarding }) => {
  const { user } = useAuth();
  const { activeTheme } = useTheme(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  const plan = user?.plan || 'Free';

  const handleProfileClick = () => {
    onOpenOnboarding();
    setIsMenuOpen(false);
  };

  return (
    <header className="flex-shrink-0 h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-gray-800">
      <h1 className={`text-lg font-semibold ${activeTheme.textClass}`}>
        Gym Companion
      </h1>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`block focus:outline-none rounded-full border-4 border-white dark:border-gray-900 shadow-lg focus:ring-2 ${activeTheme.ringClass} focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-transform hover:scale-105`}
          >
            <AccountIcon className={activeTheme.bgClass} />
          </button>
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-50 py-1">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{user?.email || 'Utente Attuale'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">Piano: {plan}</p>
              </div>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UserCog size={16} /> Modifica Profilo
              </button>
              {/* Il link "Passa a Pro" viene mostrato solo se l'utente non è Pro */}
              {plan !== 'Pro' && (
                <Link to="/upgrade" className="block" onClick={() => setIsMenuOpen(false)}>
                    <span className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Star size={16} className={activeTheme.textClass} /> Passa a Pro
                    </span>
                </Link>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};