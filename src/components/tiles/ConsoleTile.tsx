import React from 'react';
import { useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import './ConsoleTile.css';

export const ConsoleTile: TileComponentType = () => {
  const { lines } = useGameSocket();

  return (
    <div className="console">
      {lines && lines.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
    </div>
  );
}

ConsoleTile.title = "Torchship Console";
ConsoleTile.viewId = 'console';

export default ConsoleTile;