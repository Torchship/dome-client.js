import React from 'react';
import { MosaicNode } from 'react-mosaic-component';
import Settings from '../models/Settings';

export type ViewId = 'console' | 'character';

export interface ToolbarAction {
  onClick: (setSettings: (newSettings: Settings) => void) => void;
  icon?: string;
  style?: React.CSSProperties;
  text?: string;
  color?: "info" | "success" | "error" | "warning";
}

export interface TileComponentType extends React.FC {
  viewId: ViewId;
  title: string;
  getToolbarActions: (settings: Settings, nodeGraph: MosaicNode<ViewId> | null, setNodeGraph: React.Dispatch<React.SetStateAction<MosaicNode<ViewId> | null>>) => ToolbarAction[];
}

export default TileComponentType;