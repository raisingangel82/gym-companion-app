// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { themeColorPalettes } from '../data/colorPalette';
import type { ColorPalette, ColorShade } from '../types';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeColor: ColorPalette;
  setActiveColor: (colorName: string) => void;
  activeShade: ColorShade;
  setActiveShade: (shade: ColorShade) => void;
  activeTheme: ColorPalette['shades'][ColorShade];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Funzione sicura per leggere i valori dal localStorage e fornire uno stato iniziale garantito.
 * Questo previene errori di runtime se i dati salvati non sono più validi.
 */
const getInitialState = () => {
  const defaultColor = themeColorPalettes[0];
  const defaultShade: ColorShade = '700';

  // 1. Carica il colore salvato. Se non è valido, usa il colore di default.
  const savedColorName = localStorage.getItem('theme_color');
  const color = themeColorPalettes.find(p => p.base === savedColorName) || defaultColor;

  // 2. Carica la tonalità salvata.
  const savedShade = localStorage.getItem('theme_shade');

  // 3. VALIDA la tonalità: controlla che la tonalità salvata esista nella palette del colore caricato.
  //    Se non esiste, usa la tonalità di default. Questo è il fix cruciale.
  const shade = (savedShade && Object.keys(color.shades).includes(savedShade)
    ? savedShade
    : defaultShade) as ColorShade;
  
  // 4. Carica la modalità light/dark.
  const savedMode = localStorage.getItem('theme');
  const mode = (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'light';

  return { color, shade, mode };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Inizializza lo stato usando la nostra funzione sicura
  const initialState = getInitialState();
  
  const [theme, setTheme] = useState<'light' | 'dark'>(initialState.mode);
  const [activeColor, setActiveColorState] = useState<ColorPalette>(initialState.color);
  const [activeShade, setActiveShadeState] = useState<ColorShade>(initialState.shade);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const setActiveColor = (colorName: string) => {
    const newColor = themeColorPalettes.find(p => p.base === colorName);
    if (newColor) {
      setActiveColorState(newColor);
      localStorage.setItem('theme_color', colorName);
    }
  };

  const setActiveShade = (shade: ColorShade) => {
    setActiveShadeState(shade);
    localStorage.setItem('theme_shade', shade);
  };

  // Questa computazione ora è sicura perché lo stato iniziale è sempre valido.
  const activeTheme = useMemo(() => {
    // Aggiungiamo un'ulteriore sicurezza: se per qualche motivo il calcolo fallisce,
    // ritorna una tonalità di default di quella palette.
    return activeColor.shades[activeShade] || activeColor.shades['700'];
  }, [activeColor, activeShade]);

  const value = { theme, toggleTheme, activeColor, setActiveColor, activeShade, setActiveShade, activeTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve essere usato all\'interno di un ThemeProvider');
  }
  return context;
};