// src/data/colorPalette.ts
import type { ColorPalette, ColorShade, ColorDefinition } from '../types';

export const themeColorPalettes: ColorPalette[] = [
  { name: 'Pietra', base: 'stone', shades: {
    '400': { hex: '#a8a29e', bgClass: 'bg-stone-400', textClass: 'text-stone-400', borderClass: 'border-stone-400', ringClass: 'ring-stone-400' },
    '700': { hex: '#44403c', bgClass: 'bg-stone-700', textClass: 'text-stone-700', borderClass: 'border-stone-700', ringClass: 'ring-stone-700' },
    '800': { hex: '#292524', bgClass: 'bg-stone-800', textClass: 'text-stone-800', borderClass: 'border-stone-800', ringClass: 'ring-stone-800' },
  }},
  { name: 'Rosso', base: 'red', shades: {
    '400': { hex: '#f87171', bgClass: 'bg-red-400', textClass: 'text-red-400', borderClass: 'border-red-400', ringClass: 'ring-red-400' },
    '700': { hex: '#b91c1c', bgClass: 'bg-red-700', textClass: 'text-red-700', borderClass: 'border-red-700', ringClass: 'ring-red-700' },
    '800': { hex: '#991b1b', bgClass: 'bg-red-800', textClass: 'text-red-800', borderClass: 'border-red-800', ringClass: 'ring-red-800' },
  }},
  { name: 'Arancione', base: 'orange', shades: {
    '400': { hex: '#fb923c', bgClass: 'bg-orange-400', textClass: 'text-orange-400', borderClass: 'border-orange-400', ringClass: 'ring-orange-400' },
    '700': { hex: '#c2410c', bgClass: 'bg-orange-700', textClass: 'text-orange-700', borderClass: 'border-orange-700', ringClass: 'ring-orange-700' },
    '800': { hex: '#9a3412', bgClass: 'bg-orange-800', textClass: 'text-orange-800', borderClass: 'border-orange-800', ringClass: 'ring-orange-800' },
  }},
  { name: 'Verde', base: 'green', shades: {
    '400': { hex: '#4ade80', bgClass: 'bg-green-400', textClass: 'text-green-400', borderClass: 'border-green-400', ringClass: 'ring-green-400' },
    '700': { hex: '#15803d', bgClass: 'bg-green-700', textClass: 'text-green-700', borderClass: 'border-green-700', ringClass: 'ring-green-700' },
    '800': { hex: '#14532d', bgClass: 'bg-green-800', textClass: 'text-green-800', borderClass: 'border-green-800', ringClass: 'ring-green-800' },
  }},
  { name: 'Blu', base: 'blue', shades: {
    '400': { hex: '#60a5fa', bgClass: 'bg-blue-400', textClass: 'text-blue-400', borderClass: 'border-blue-400', ringClass: 'ring-blue-400' },
    '700': { hex: '#1d4ed8', bgClass: 'bg-blue-700', textClass: 'text-blue-700', borderClass: 'border-blue-700', ringClass: 'ring-blue-700' },
    '800': { hex: '#1e40af', bgClass: 'bg-blue-800', textClass: 'text-blue-800', borderClass: 'border-blue-800', ringClass: 'ring-blue-800' },
  }},
];