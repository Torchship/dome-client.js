import { useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';

import './ConsoleTile.css';
import Settings from '../../models/Settings';
import { deepClone } from '../../util';
import Button from '../Button';
import VirtualTerminal from '../VirtualTerminal';

export const ConsoleTile: TileComponentType = () => {
  const { connectionState, history } = useGameSocket();  

  return (
    <>
      { connectionState === 'disconnected'
        ? (
          <div className="overlay">
            <div className="popup">
              <h3>Connection Lost</h3>
              <span>Would you like to reconnect?</span>
              <Button label="Reconnect"></Button>
            </div>
          </div>
          )
        : null
      }      
      <VirtualTerminal history={history}/>
    </>
  );
}

ConsoleTile.title = "Torchship Console";
ConsoleTile.viewId = 'console';
ConsoleTile.getToolbarActions = (settings: Settings) => [
  {
    onClick: (setSettings: (newSettings: Settings) => void) => {
      const newSettings = deepClone(settings);
      newSettings.inputEcho = !settings.inputEcho;
      setSettings(newSettings);
    },
    text: 'Echo',
    color: !settings.inputEcho ? 'info' : 'warning'
  },
  {
    onClick: (setSettings: (newSettings: Settings) => void) => {
      const newSettings = deepClone(settings);
      newSettings.autoscroll = !settings.autoscroll;
      setSettings(newSettings);
    },
    text: settings.autoscroll ? "Pause Scroll" : "Resume Scroll",
    color: settings.autoscroll ? 'info' : 'warning'
  },
];

export default ConsoleTile;