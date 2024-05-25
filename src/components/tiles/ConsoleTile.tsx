import React, {useCallback} from 'react';
import { GameMessage, TextFragment, useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import { Virtuoso } from "react-virtuoso";
import './ConsoleTile.css';
import { Settings, useSettings } from '../providers/SettingsProvider';
import FontStyler from '../FontStyler';

const renderTextFragment = (fragment: TextFragment, line_number: number, index: number): JSX.Element => {
  const style: React.CSSProperties = {
      fontWeight: fragment.ansi?.is_bold ? 'bold' : 'normal',
      color: fragment.ansi?.foreground_color || 'inherit',
      backgroundColor: fragment.ansi?.background_color || 'inherit',
  };

  return (
    <span key={`${line_number}-${index}`} style={style}>
        {fragment.content}
    </span>
  );
};

export const ConsoleTile: TileComponentType = () => {
  const { history } = useGameSocket();
  const { settings } = useSettings();

  const itemContent = useCallback(
    (_index: number, gameMessage: GameMessage) => (
      <div key={gameMessage.line_number}>
        {gameMessage.parsed.map((fragment, index) => (
          renderTextFragment(fragment, gameMessage.line_number, index)
        ))}
      </div>
    ),
    []
  );

  return (
    <FontStyler 
      className="console"
      settings={settings.output}
      >
      <Virtuoso
        className="virtuoso-container"
        data={history}
        followOutput={true}
        initialTopMostItemIndex={history?.length}
        itemContent={itemContent}
      />
    </FontStyler>
  );
}

ConsoleTile.title = "Torchship Console";
ConsoleTile.viewId = 'console';
ConsoleTile.getToolbarActions = (settings: Settings) => [
  {
    onClick: () => console.log('Close clicked'),
    text: settings.autoscroll ? "Pause Scroll" : "Resume Scroll",
  },
];

export default ConsoleTile;