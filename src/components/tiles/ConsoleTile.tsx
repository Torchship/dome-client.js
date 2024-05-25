import React, {useState, useRef, useEffect, RefObject} from 'react';
import { GameMessage, TextFragment, useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import { VariableSizeList as List } from 'react-window';
import './ConsoleTile.css';
import AutoSizer from "react-virtualized-auto-sizer";

const measureTextHeight = (ref: RefObject<HTMLDivElement>, text: string): number => {
  if (!ref.current) return 0;

  // Create a temporary child element
  const tempChild = document.createElement('div');
  // tempChild.style.visibility = 'hidden';
  tempChild.innerText = text;

  // Append the child to the container
  ref.current.appendChild(tempChild);

  // tempChild.
  const height = tempChild.getBoundingClientRect().height;

  // Remove the temporary child
  ref.current.removeChild(tempChild);

  return height;
};

const renderTextFragment = (fragment: TextFragment, key: number | string): JSX.Element => {
  const style: React.CSSProperties = {
      fontWeight: fragment.ansi?.is_bold ? 'bold' : 'normal',
      color: fragment.ansi?.foreground_color || 'inherit',
      backgroundColor: fragment.ansi?.background_color || 'inherit',
  };

  if (typeof fragment.content === 'string') {
      return (
          <span key={key} style={style}>
              {fragment.content}
          </span>
      );
  } else {
      return (
          <span key={key} style={style}>
              {fragment.content.map((nestedFragment, index) =>
                  renderTextFragment(nestedFragment, `${key}-${index}`)
              )}
          </span>
      );
  }
};

export const ConsoleTile: TileComponentType = () => {
  const { history } = useGameSocket();
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef({});
  const rowHeights = useRef({});

  function getRowHeight(index) {
    return rowHeights.current[index] || measureTextHeight(consoleContainerRef, history[index].raw);
  }

  function Row({ index }) {
    const gameMessage: GameMessage = history[index];

    useEffect(() => {
      if (consoleContainerRef) {
        const height = measureTextHeight(consoleContainerRef, gameMessage.raw);
        if (height)
          setRowHeight(index, height);
      }
    }, [consoleContainerRef])

    return (
      <div>
        {renderTextFragment(gameMessage.parsed, 0)}
      </div>
    );
  }

  function setRowHeight(index, size) {
    listRef.current.resetAfterIndex(0);
    rowHeights.current = { ...rowHeights.current, [index]: size };
  }

  function scrollToBottom() {
    listRef.current.scrollToItem(history.length - 1, "end");
  }

  useEffect(() => {
    if (history.length > 0) {
      scrollToBottom();
    }
  }, [history]);

  return (
    <div className="console" ref={consoleContainerRef}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            itemCount={history.length}
            itemSize={getRowHeight}
            height={height}
            width={width}
            >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

ConsoleTile.title = "Torchship Console";
ConsoleTile.viewId = 'console';
ConsoleTile.getToolbarActions = () => [];

export default ConsoleTile;