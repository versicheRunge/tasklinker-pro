
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fontSize: 1 | 2 | 3;
  setFontSize: (size: 1 | 2 | 3) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  fontSize: 2,
  setFontSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });
  
  const [fontSize, setFontSize] = useState<1 | 2 | 3>(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return savedFontSize ? parseInt(savedFontSize) as 1 | 2 | 3 : 2;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const savedContrast = localStorage.getItem('highContrast');
    return savedContrast === 'true';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize.toString());
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    
    if (fontSize === 1) {
      document.documentElement.classList.add('text-sm');
    } else if (fontSize === 3) {
      document.documentElement.classList.add('text-lg');
    }
    // fontSize 2 is default (text-base)
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('highContrast', highContrast.toString());
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      fontSize, 
      setFontSize,
      highContrast,
      setHighContrast
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
