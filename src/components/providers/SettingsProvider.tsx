import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Settings, { DEFAULT_SETTINGS } from '../../models/Settings';
import DEFAULT_THEME, { Theme, THEMES } from '../../themes';

interface SettingsContextProps {
  isSettingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>> | null;
  settings: Settings;
  getTheme: () => Theme;
  saveSettings: () => void;
  setSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextProps>({ 
  isSettingsOpen: false, 
  setSettingsOpen: null, 
  settings: DEFAULT_SETTINGS, 
  saveSettings: () => {},
  setSettings: () => {},
  getTheme: () => DEFAULT_THEME
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
  // const settings = useRef<Settings>(DEFAULT_SETTINGS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const saveSettings = () => {
    localStorage.setItem("settings", JSON.stringify(settings));
  };

  const loadSettings = () => {
    const rawSettings = localStorage.getItem("settings");
    if (!rawSettings) return;
    setSettings(JSON.parse(rawSettings));
  }

  const getTheme = () => {
    return THEMES.find(t => t.name === settings.theme);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ isSettingsOpen, setSettingsOpen, settings: settings, saveSettings, setSettings, getTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};
