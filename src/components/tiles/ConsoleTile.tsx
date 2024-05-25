import React, {useRef, useCallback, useEffect} from 'react';
import { GameMessage, TextFragment, useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import './ConsoleTile.css';

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
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const virtualWindowRef = useRef<VirtuosoHandle>(null);

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
  
  useEffect(() => {
    // Why am I doing this every 50ms? because autoscroll sucks in virtuoso.
    const interval = setInterval(() => {
      if (!virtualWindowRef.current) return;
      virtualWindowRef.current.scrollToIndex(history.length);
    }, 50);
  
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  return (
    <div className="console" ref={consoleContainerRef}>
      <Virtuoso
        ref={virtualWindowRef}
        data={history}
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