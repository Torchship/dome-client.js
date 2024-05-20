import React from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { ConsoleTile } from './tiles/ConsoleTile';

import 'react-mosaic-component/react-mosaic-component.css';
import './ClientWindowManager.css';
import {TileComponentType, ViewId} from './TileComponent';
import { CharacterTile } from './tiles/CharacterTile';

const VIEW_COMPONENT_MAP: Record<ViewId, TileComponentType> = {
  console: ConsoleTile,
  character: CharacterTile
};

export const ClientWindowManager: React.FC = () => { 
  const renderToolbar = (id: ViewId) => {
    const ViewComponent = VIEW_COMPONENT_MAP[id];
    const actions = ViewComponent.getToolbarActions();
    return (
      <div className="window-toolbar">
        {ViewComponent.title}
        <div className="window-toolbar-buttons">
          {actions.map((action, index) => (
            <button key={index} onClick={action.onClick}>
              <img src={action.icon}/>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Mosaic<ViewId>
        renderTile={(id, path) => {
          const Component = VIEW_COMPONENT_MAP[id];
          return (
            <MosaicWindow<ViewId> 
              path={path} 
              title={Component.title} 
              renderToolbar={() => renderToolbar(id)}
              renderPreview={() => <div></div>}
              >
                <Component />
            </MosaicWindow>
          )}}
        initialValue={{
          direction: 'row',
          first: 'character',
          second: 'console',
          splitPercentage: '20'
        }}
      />
  );
};

export default ClientWindowManager;