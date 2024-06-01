import React from 'react';
import { MosaicNode } from 'react-mosaic-component';
import Settings from '../models/Settings';

export type ViewId = 'console' | 'character';

interface TileComponentProps {
  state: Record<string, any>;
}

export interface TileComponentType extends React.FC<TileComponentProps> {
  viewId: ViewId;
  title: string;
  getToolbarActions: (settings: Settings, nodeGraph: MosaicNode<ViewId> | null, setNodeGraph: (newNodeGraph: MosaicNode<ViewId> | null) => void) => ToolbarAction[];
}

export default TileComponentType;