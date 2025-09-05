// src/react-extensions.d.ts

import 'react';

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // Add the webkitdirectory property to the existing InputHTMLAttributes interface
    webkitdirectory?: string;
  }
}