import React from 'react';
import TileComponentType from '../TileComponent';

export const CharacterTile: TileComponentType = () => {
  return (
    <div className='character-pane'>
      Character Tile
    </div>
  );
}

CharacterTile.title = "Character";
CharacterTile.viewId = 'character';

export default CharacterTile;