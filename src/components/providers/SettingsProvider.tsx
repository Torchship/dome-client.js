import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { ConsoleSettings } from '../FontStyler';

const DEFAULT_SETTINGS: Settings = {
  autoscroll: true,
  input: {
    fontType: "Source Code Pro",
    fontSize: 14,
    lineWidth: 78
  },
  output: {
    fontType: "Source Code Pro",
    fontSize: 14,
    lineWidth: 78
  }
}

export interface Settings {
  autoscroll: boolean;
  output: ConsoleSettings;
  input: ConsoleSettings;
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
