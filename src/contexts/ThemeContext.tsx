import React, {createContext, useContext, ReactNode} from 'react';
import {colors} from '../constants/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  colors,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
  // Polyphonic is always in dark mode
  const isDarkMode = true;

  return (
    <ThemeContext.Provider value={{isDarkMode, colors}}>
      {children}
    </ThemeContext.Provider>
  );
}