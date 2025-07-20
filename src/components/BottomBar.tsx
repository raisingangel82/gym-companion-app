// src/components/BottomBar.tsx
import React from 'react';
import { Settings, Dumbbell, BarChart3, Music } from 'lucide-react'; 
import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface BottomBarProps {
  actionConfig: {
    icon: React.ElementType;
    onClick: () => void;
    label: string;
  };
}

export const BottomBar: React.FC<BottomBarProps> = ({ actionConfig }) => {
  const { activeTheme } = useTheme();
  const { icon: ActionIcon, onClick, label } = actionConfig;
  
  const navItems = [
    { icon: Dumbbell, label: 'Allenati', path: '/' },
    { icon: Settings, label: 'Impostazioni', path: '/settings' },
    { type: 'action' as const, icon: ActionIcon, action: onClick, label: label },
    { icon: Music, label: 'Musica', path: '/music' },
    { icon: BarChart3, label: 'Statistiche', path: '/stats' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 grid grid-cols-5 items-center z-40">
      {navItems.map((item, index) => {
        if (item.type === 'action') {
          return (
            <div key={index} className="flex justify-center relative z-50">
              <button 
                onClick={onClick} 
                aria-label={label} 
                className={`flex items-center justify-center text-white rounded-full w-14 h-14 -mt-7 border-4 border-white dark:border-gray-900 shadow-lg transition-all transform hover:scale-110 ${activeTheme.bgClass} hover:opacity-90 disabled:bg-gray-400`}
              >
                <ActionIcon size={28} />
              </button>
            </div>
          );
        }
        return (
          <NavLink
            key={index}
            to={item.path!}
            end={item.path === '/'}
            aria-label={item.label}
            className="flex flex-col items-center justify-center h-full w-full text-xs text-gray-500 dark:text-gray-400 group"
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center w-12 h-8 rounded-lg transition-colors group-hover:bg-gray-100 dark:group-hover:bg-gray-700 ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                    <item.icon 
                      className={`h-6 w-6 transition-colors ${isActive ? activeTheme.textClass : 'text-gray-500 dark:text-gray-400'}`} 
                    />
                </div>
                <span className={`mt-1 text-center ${isActive ? activeTheme.textClass : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};