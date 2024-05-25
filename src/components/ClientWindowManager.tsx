import React, {useState} from 'react';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import { ConsoleTile } from './tiles/ConsoleTile';

import 'react-mosaic-component/react-mosaic-component.css';
import './ClientWindowManager.css';
import {TileComponentType, ViewId} from './TileComponent';
import { CharacterTile } from './tiles/CharacterTile';
import { useSettings } from './providers/SettingsProvider';

const VIEW_COMPONENT_MAP: Record<ViewId, TileComponentType> = {
  console: ConsoleTile,
  character: CharacterTile
};

export const ClientWindowManager: React.FC = () => { 
  const [nodeGraph, setNodeGraph] = useState<MosaicNode<ViewId> | null>('console');
  const {settings} = useSettings();

  const renderToolbar = (id: ViewId) => {
    const ViewComponent = VIEW_COMPONENT_MAP[id];
    const actions = ViewComponent.getToolbarActions(settings, nodeGraph, setNodeGraph);
    return (
      <div className="window-toolbar">
        {ViewComponent.title}
        <div className="window-toolbar-buttons">
          {actions.map((action, index) => (
            <button key={index} onClick={action.onClick} style={action.style}>
              {action.icon ? (<img src={action.icon}/>) : null}
              {action.text ? (action.text) : null}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const onChange = (currentNode: MosaicNode<ViewId> | null) => {
    setNodeGraph(currentNode);
  };

  return (
    <Mosaic<ViewId>
        value={nodeGraph}
        onChange={onChange}
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
      />
  );
};

export default ClientWindowManager;