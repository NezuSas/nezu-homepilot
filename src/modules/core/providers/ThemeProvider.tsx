"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SnowParticles } from '../components/SnowParticles';
import { HalloweenParticles } from '../components/HalloweenParticles';
import { SakuraParticles } from '../components/SakuraParticles';
import { BeachParticles } from '../components/BeachParticles';
import { AutumnParticles } from '../components/AutumnParticles';
import { NewYearParticles } from '../components/NewYearParticles';
import { ValentineParticles } from '../components/ValentineParticles';

export type ThemeType = 'none' | 'christmas' | 'halloween' | 'spring' | 'summer' | 'autumn' | 'newyear' | 'valentine';

interface ThemeContextType {
  activeTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<ThemeType>('none');

  useEffect(() => {
    const storedTheme = localStorage.getItem('active-theme') as ThemeType;
    if (storedTheme && storedTheme !== 'none') {
      setActiveTheme(storedTheme);
    }
  }, []);

  const setTheme = (theme: ThemeType) => {
    setActiveTheme(theme);
    localStorage.setItem('active-theme', theme);
  };

  const renderParticles = () => {
    switch (activeTheme) {
      case 'christmas':
        return <SnowParticles />;
      case 'halloween':
        return <HalloweenParticles />;
      case 'spring':
        return <SakuraParticles />;
      case 'summer':
        return <BeachParticles />;
      case 'autumn':
        return <AutumnParticles />;
      case 'newyear':
        return <NewYearParticles />;
      case 'valentine':
        return <ValentineParticles />;
      default:
        return null;
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme }}>
      {renderParticles()}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
