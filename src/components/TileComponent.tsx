import React, { Dispatch, SetStateAction } from 'react';
import { MosaicNode } from 'react-mosaic-component';

export type ViewId = 'console' | 'character';

export interface ToolbarAction {
  onClick: () => void;
  icon: string;
}

export interface TileComponentType extends React.FC {
  viewId: ViewId;
  title: string;
  getToolbarActions: (nodeGraph: MosaicNode<ViewId> | null, setNodeGraph: React.Dispatch<React.SetStateAction<MosaicNode<ViewId> | null>>) => ToolbarAction[];
}

export default TileComponentType;