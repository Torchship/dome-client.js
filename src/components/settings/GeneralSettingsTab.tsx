import React from 'react';
import './SettingsTab.css';
import { useSettings } from '../providers/SettingsProvider';
import { deepClone } from '../../util';
import Checkbox from '../Checkbox';

export const GeneralSettingsTab: React.FC = () => {
  const {settings, setSettings} = useSettings();

  return (
    <div className="settings-form">
      <h1>General Settings</h1>
      <div className="settings-item">
        <Checkbox 
          label="Clear Input On Enter"
          value={settings.autoClearInput}
          onChange={() => {
            const newSettings = deepClone(settings);
            newSettings.autoClearInput = !newSettings.autoClearInput;
            setSettings(newSettings);
          }}/>
        <div className="option">
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsTab;