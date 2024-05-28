import React from 'react';
import FontSelector from '../FontSelector';
import NumberPicker from "react-widgets/NumberPicker";
import './SettingsTab.css';
import { useSettings } from '../providers/SettingsProvider';
import { deepClone } from '../../util';

export const OutputSettingsTab: React.FC = () => {
  const {settings, setSettings} = useSettings();

  return (
    <div className="settings-form">
      <h1>Output Display Settings</h1>
      <div className="settings-item">
        <h3>Font Size</h3>
        <div className="option">
          <NumberPicker value={settings.output.fontSize} onChange={(newValue) => {
            if (!newValue) return;
            const newSettings = deepClone(settings);
            newSettings.output.fontSize = newValue;
            setSettings(newSettings);
          }}/>
        </div>
      </div>
      <div className="settings-item">
        <h3>Font Family</h3>
        <div className="option">
          <FontSelector/>
        </div>
      </div>
    </div>
  );
};

export default OutputSettingsTab;