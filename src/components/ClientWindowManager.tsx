import React, {useEffect, useState} from 'react';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import { ConsoleTile } from './tiles/ConsoleTile';

import 'react-mosaic-component/react-mosaic-component.css';
import './ClientWindowManager.css';
import {TileComponentType, ViewId} from './TileComponent';
import { CharacterTile } from './tiles/CharacterTile';
import { useSettings } from './providers/SettingsProvider';
import Button from './Button';
import { deepClone } from '../util';

const VIEW_COMPONENT_MAP: Record<ViewId, TileComponentType> = {
  console: ConsoleTile,
  character: CharacterTile
};

export const ClientWindowManager: React.FC = () => { 
  const {settings, setSettings} = useSettings();

  const setNodeGraph = (newNodeGraph: MosaicNode<ViewId> | null) => {
    const newSettings = deepClone(settings);
    newSettings.nodeGraph = newNodeGraph;
    setSettings(newSettings);
  }
  
  const renderToolbar = (id: ViewId) => {
    const ViewComponent = VIEW_COMPONENT_MAP[id];
    const actions = ViewComponent.getToolbarActions(settings, settings.nodeGraph, setNodeGraph);
    return (
      <div className="window-toolbar">
        {ViewComponent.title}
        <div className="window-toolbar-buttons">
          {actions.map((action, _index) => (
            <Button 
              className="toolbar-button" 
              color={action.color || 'info'} 
              onClick={() => action.onClick(setSettings)}
            >
              {action.icon ? (<img src={action.icon}/>) : null}
              {action.text ? (action.text) : null}
            </Button>
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
        value={settings.nodeGraph}
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