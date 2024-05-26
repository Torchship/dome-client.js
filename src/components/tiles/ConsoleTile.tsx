import React, {useRef, useEffect} from 'react';
import { TextFragment, useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import {List, AutoSizer, CellMeasurerCache, CellMeasurer} from 'react-virtualized';
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
  const virtualListRef = useRef<List>(null);
  const { history } = useGameSocket();
  const { settings } = useSettings();

  useEffect(() => {
    if (!virtualListRef.current) return;
    virtualListRef.current.scrollToRow(history.length);
  }, [history])

  const cache = new CellMeasurerCache({
    fixedWidth: true
  });  

  function rowRenderer(params: any) {
    const gameMessage = history[params.index];
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={params.key}
        parent={params.parent}
        rowIndex={params.index}>
        <div key={params.key} style={params.style}>
          {gameMessage.parsed.map((fragment, index) => (
            renderTextFragment(fragment, gameMessage.line_number, index)
          ))}
        </div>
      </CellMeasurer>
    );
  }
  
  return (
    <FontStyler 
      className="console"
      settings={settings.output}>
      <AutoSizer>
        {({height, width}) => (
          <List
            deferredMeasurementCache={cache}
            ref={virtualListRef}
            height={height}
            rowCount={history.length}
            rowRenderer={rowRenderer}
            rowHeight={cache.rowHeight}
            width={width}
          />
        )}
      </AutoSizer>
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