import { useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType, { TileToolbarType } from '../TileComponent';

import './ConsoleTile.css';
import Button from '../Button';
import VirtualTerminal from '../VirtualTerminal';
import { useSettings } from '../providers/SettingsProvider';
import { deepClone } from '../../util';

export const ConsoleTileToolbar: TileToolbarType = () => {
  const { settings, setSettings } = useSettings();

  const toggleEcho = () => {
    const newSettings = deepClone(settings);
    newSettings.inputEcho = !settings.inputEcho;
    setSettings(newSettings);
  };

  const toggleAutoScroll = () => {
    const newSettings = deepClone(settings);
    newSettings.autoscroll = !settings.autoscroll;
    setSettings(newSettings);
  }

  return (
    <>
      <Button 
        label='Echo' 
        onClick={toggleEcho} 
        className='toolbar-button'
        color={!settings.inputEcho ? 'info' : 'warning'} />
      <Button 
        label={settings.autoscroll ? "Pause Scroll" : "Resume Scroll"}
        color={settings.autoscroll ? 'info' : 'warning'}
        onClick={toggleAutoScroll} 
        className='toolbar-button' />
    </>
  );
};

export const ConsoleTile: TileComponentType = () => {
  const { connectionState, history, reconnect } = useGameSocket();  

  return (
    <>
      { connectionState === 'disconnected'
        ? (
          <div className="overlay">
            <div className="popup">
              <h3>Connection Lost</h3>
              <span>Would you like to reconnect?</span>
              <Button label="Reconnect" onClick={reconnect}></Button>
            </div>
          </div>
          )
        : null
      }      
      <VirtualTerminal history={history}/>
    </>
  );
};

export default ConsoleTile;