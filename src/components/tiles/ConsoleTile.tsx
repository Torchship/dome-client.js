import React, {useRef, useCallback} from 'react';
import { GameMessage, TextFragment, useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import { Virtuoso } from "react-virtuoso";
import './ConsoleTile.css';

const renderTextFragment = (fragment: TextFragment, line_number: number, index: number): JSX.Element | null => {
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
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const lastLine = history?.length ? history[history?.length - 1] : null;

  const onFollowOutputHandler = useCallback(
    (atBottom) => {
      if (atBottom) {
        return "auto";
      } else {
        return false;
      }
    },
    [lastLine]
  );

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
    <div className="console" ref={consoleContainerRef}>
      <Virtuoso
        data={history}
        followOutput={onFollowOutputHandler}
        initialTopMostItemIndex={history?.length}
        itemContent={itemContent}
      />
    </div>
  );
}

ConsoleTile.title = "Torchship Console";
ConsoleTile.viewId = 'console';
ConsoleTile.getToolbarActions = () => [];

export default ConsoleTile;