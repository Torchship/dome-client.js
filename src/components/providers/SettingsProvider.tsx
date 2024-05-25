// src/socketContext.tsx
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

const DEFAULT_SETTINGS: Settings = {
  autoscroll: true,
  output: {
    fontType: "Source Code Pro",
    fontSize: 14
  }
}

export interface ConsoleSettings {
  fontType: string;
  fontSize: number;
}

export interface Settings {
  autoscroll: boolean;
  output: ConsoleSettings;
}

interface SettingsContextProps {
  isSettingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
  settings: Settings;
}

const SettingsContext = createContext<SettingsContextProps>({ isSettingsOpen: false, setSettingsOpen: null, settings: DEFAULT_SETTINGS });

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
  const settings = useRef<Settings>(DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider value={{ isSettingsOpen, setSettingsOpen, settings: settings.current }}>
      {children}
    </SettingsContext.Provider>
  );
};
