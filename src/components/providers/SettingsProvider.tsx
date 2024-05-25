// src/socketContext.tsx
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface Settings {

}

interface SettingsContextProps {
  isSettingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
  settings: React.MutableRefObject<Settings> | null;
}

const SettingsContext = createContext<SettingsContextProps>({ isSettingsOpen: false, setSettingsOpen: null, settings: null });

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
  const settings = useRef<Settings>({});

  return (
    <SettingsContext.Provider value={{ isSettingsOpen, setSettingsOpen, settings }}>
      {children}
    </SettingsContext.Provider>
  );
};
