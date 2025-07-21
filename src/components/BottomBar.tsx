import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, BarChart2, Music } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { ActionConfig } from '../types/actions';

interface BottomBarProps {
  actionConfig: ActionConfig;
}

const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => {
  const { activeTheme } = useTheme();
  return (
    <NavLink to={to} className="flex flex-col items-center justify-center h-full w-full text-xs text-gray-500 dark:text-gray-400">
      {({ isActive }) => (
        <>
          <Icon size={24} className={isActive ? activeTheme.textClass : ''} />
          <span className={isActive ? activeTheme.textClass : ''}>{label}</span>
        </>
      )}
    </NavLink>
  );
};

export const BottomBar: React.FC<BottomBarProps> = ({ actionConfig }) => {
  const { activeTheme } = useTheme();
  const { icon: ActionIcon, onClick, label, disabled = false } = actionConfig;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="container mx-auto flex justify-around items-center h-full max-w-lg">
        <NavItem to="/" icon={Home} label="Workout" />
        <NavItem to="/manage" icon={ClipboardList} label="Gestisci" />
        <div className="w-16 h-16" />
        <NavItem to="/stats" icon={BarChart2} label="Statistiche" />
        <NavItem to="/music" icon={Music} label="Musica" />
      </div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        {/* Stile aggiornato per il pulsante */}
        <button
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg border-4 border-gray-50 dark:border-gray-900 hover:scale-105
            ${
              disabled 
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                : activeTheme.bgClass
            }`
          }
        >
          <ActionIcon size={32} />
        </button>
      </div>
    </nav>
  );
};