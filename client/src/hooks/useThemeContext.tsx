import React, { createContext, useContext, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

type Theme = 'system' | 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeHook = useTheme();

  // Initialize theme on mount
  useEffect(() => {
    // Apply initial theme based on stored preference or system preference
    const applyInitialTheme = () => {
      const stored = localStorage.getItem('theme') as Theme;
      // Handle legacy 'nature' theme by defaulting to 'system'
      const preferredTheme = stored === 'nature' ? 'system' : (stored || 'system');
      
      const root = document.documentElement;
      
      // Remove all theme classes first
      root.classList.remove('dark', 'nature');
      
      if (preferredTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') {
          root.classList.add('dark');
        }
      } else if (preferredTheme === 'dark') {
        root.classList.add('dark');
      }
    };

    applyInitialTheme();
  }, []);

  return (
    <ThemeContext.Provider value={themeHook}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
