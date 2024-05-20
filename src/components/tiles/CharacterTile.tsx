import React from 'react';
import TileComponentType from '../TileComponent';
import CrossIcon from '../../assets/x.svg';

export const CharacterTile: TileComponentType = () => {
  return (
    <div className='character-pane'>
      Character Tile
    </div>
  );
}

CharacterTile.title = "Character";
CharacterTile.viewId = 'character';
CharacterTile.getToolbarActions = () => [
  {
    onClick: () => console.log('Close clicked'),
    icon: CrossIcon
  },
];

export default CharacterTile;