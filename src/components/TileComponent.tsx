import React from 'react';

export type ViewId = 'console' | 'character';

export interface ToolbarAction {
  onClick: () => void;
  icon: string;
}

export interface TileComponentType extends React.FC {
  viewId: ViewId;
  title: string;
  getToolbarActions: () => ToolbarAction[];
}

export default TileComponentType;