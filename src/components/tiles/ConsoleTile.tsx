import { useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType, { TileToolbarType } from '../TileComponent';

import './ConsoleTile.css';
import Button from '../Button';
import VirtualTerminal from '../VirtualTerminal';

export const ConsoleTileToolbar: TileToolbarType = () => {
  return (
    <>
      <Button label='Echo' className='toolbar-button'/>
      <Button label='Pause Scroll' className='toolbar-button'/>
    </>
  );
};

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
};

export default ConsoleTile;