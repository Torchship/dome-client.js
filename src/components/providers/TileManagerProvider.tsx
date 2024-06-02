import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Corner, getLeaves, getNodeAtPath, getOtherDirection, getPathToCorner, MosaicDirection, MosaicNode, MosaicParent, updateTree } from 'react-mosaic-component';
import dropRight from 'lodash/dropRight';
import TileComponentType from '../TileComponent';
import { TileModel } from '../../models/TileModel';
import { deepClone } from '../../util';
import ConsoleTile, { ConsoleTileToolbar } from '../tiles/ConsoleTile';
import MapTile from '../tiles/MapTile';

export interface TileManagerContextProps {
  nodeGraph: MosaicNode<number> | null;

  updateNodeGraph(newGraph: MosaicNode<number> | null): void;
  getViewModel(viewId: number): TileModel;
  spawnTile(windowType: TileComponentType, title: string): number;
}

const TileManagerContext = createContext<TileManagerContextProps>({
  nodeGraph: null,
  getViewModel: function (): TileModel {
    throw new Error('Function not implemented.');
  },
  spawnTile: function (): number {
    throw new Error('Function not implemented.');
  },
  updateNodeGraph: function (): void {
    throw new Error('Function not implemented.');
  }
});

export const useTileManager = () => useContext(TileManagerContext);

interface TileManagerProps {
  children: ReactNode;
}

export const TileManagerProvider: React.FC<TileManagerProps> = ({ children }) => {
  const [ nextViewId, setNextViewId ] = useState<number>(1);
  const [ nodeGraph, setNodeGraph ] = useState<MosaicNode<number> | null>({
    first: 1,
    second: 2,
    direction: 'row'
  });
  const [ viewModels, setViewModels ] = useState<Record<number, TileModel>>({
    1: {
      title: 'Torchship Console', 
      component: ConsoleTile, 
      toolbar: ConsoleTileToolbar, 
      persistentData: {}
    },
    2: {
      title: 'Torchship Map',
      component: MapTile,
      persistentData: {}
    }
  });

  function updateNodeGraph(newGraph: MosaicNode<number> | null): void {
    if (!newGraph) {
      setViewModels({});
      setNodeGraph(newGraph);
      return;
    }

    function keyExistsInMosaicNode(node: MosaicNode<number>, key: number): boolean {
      if (typeof node === 'number') {
          return node === key;
      }
  
      return keyExistsInMosaicNode(node.first, key) || keyExistsInMosaicNode(node.second, key);
    }

    const newViewModels = deepClone(viewModels);
    for (const key in newViewModels) {
      if (!keyExistsInMosaicNode(newGraph, parseInt(key))) {
          delete newViewModels[key];
      }
    }

    setNodeGraph(newGraph);
    setViewModels(newViewModels);
  }

  function getViewModel(viewId: number): TileModel {
    return viewModels[viewId];
  }
  

  function spawnTile(windowType: TileComponentType, title: string): number {
    const newViewId = nextViewId;
    setNextViewId(newViewId + 1);

    // Create the view model binding...
    const newViewModels = deepClone(viewModels);
    newViewModels[newViewId] = {
      title,
      component: windowType,
      persistentData: {}
    };
    setViewModels(newViewModels);

    // Actually spawn the node in the view tree...
    const totalWindowCount = getLeaves(nodeGraph).length;
    if (nodeGraph) {
      const path = getPathToCorner(nodeGraph, Corner.TOP_RIGHT);
      const parent = getNodeAtPath(nodeGraph, dropRight(path)) as MosaicParent<number>;
      const destination = getNodeAtPath(nodeGraph, path) as MosaicNode<number>;
      const direction: MosaicDirection = parent ? getOtherDirection(parent.direction) : 'row';

      let first: MosaicNode<number>;
      let second: MosaicNode<number>;
      if (direction === 'row') {
        first = destination;
        second = totalWindowCount + 1;
      } else {
        first = totalWindowCount + 1;
        second = destination;
      }

      const newNodeGraph = updateTree(nodeGraph, [
        {
          path,
          spec: {
            $set: {
              direction,
              first,
              second,
            },
          },
        },
      ]);      
      
      setNodeGraph(newNodeGraph);
    }
    return newViewId;
  }

  return (
    <TileManagerContext.Provider value={{nodeGraph, spawnTile, getViewModel, updateNodeGraph}}>
      {children}
    </TileManagerContext.Provider>
  );
};
