import React from 'react';

export type ViewId = 'console' | 'character';

export interface TileComponentType extends React.FC {
  viewId: ViewId;
  title: string;
}

export default TileComponentType;