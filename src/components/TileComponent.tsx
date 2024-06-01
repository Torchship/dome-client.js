import React from 'react';
import { TileModel } from '../models/TileModel';

export type ViewId = 'console' | 'character';

interface TileComponentProps {
  state: Record<string, any>;
}

export interface TileComponentType extends React.FC<TileComponentProps> {
}

interface TileToolbarProps {
  viewId: number;
  viewModel: TileModel;
}

export interface TileToolbarType extends React.FC<TileToolbarProps> {

}

export default TileComponentType;