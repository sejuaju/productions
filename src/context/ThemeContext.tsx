"use client"

import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="cortex-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const { theme, setTheme } = require('next-themes');
  
  const currentTheme = theme as Theme;
  
  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };
  
  return { theme: currentTheme, toggleTheme };
} 