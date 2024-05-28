import React from 'react';
import ProfilePicture from '../../assets/profile_picture.png';
import TileComponentType from '../TileComponent';
import CrossIcon from '../../assets/x.svg';
import './CharacterTile.css';

export const CharacterTile: TileComponentType = () => {
  return (
    <div className='character-pane'>
      <div className='pill'>
        Jane 'Parzival' Baka
      </div>
      <div className='portrait'>
        <img src={ProfilePicture}/>
      </div>
      <div className='pill'>
        LOCATION: The Black Cat
      </div>
      <div className='card'>
        <div className='progress-bar'>
          <div className='label'>
            Exhausted
          </div>
          <div className='bar'/>
        </div>
        <div className='progress-bar'>
          <div className='label'>
            Tired
          </div>
          <div className='bar'/>
        </div>
      </div>
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