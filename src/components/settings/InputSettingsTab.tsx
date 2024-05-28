import React from 'react';
import NumberPicker from "react-widgets/NumberPicker";
import './SettingsTab.css';
import { useSettings } from '../providers/SettingsProvider';
import { deepClone } from '../../util';

export const InputSettingsTab: React.FC = () => {
  const {settings, setSettings} = useSettings();

  return (
    <div className="settings-form">
      <h1>Input Display Settings</h1>
      <div className="settings-item">
        <h3>Font Size</h3>
        <div className="option">
          <NumberPicker value={settings.input.fontSize} onChange={(newValue) => {
            if (!newValue) return;
            const newSettings = deepClone(settings);
            newSettings.input.fontSize = newValue;
            setSettings(newSettings);
          }}/>
        </div>
      </div>
    </div>
  );
};

export default InputSettingsTab;