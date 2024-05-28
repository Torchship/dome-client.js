import React, {useRef, useEffect, useState, useMemo} from 'react';
import { GameMessage, TextFragment, useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import {List, AutoSizer} from 'react-virtualized';
import { useSettings } from '../providers/SettingsProvider';
import FontStyler from '../FontStyler';

import './ConsoleTile.css';
import 'react-virtualized/styles.css'; // only needs to be imported once
import Settings from '../../models/Settings';
import { deepClone } from '../../util';

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

const measureMonospaceCharacterWidth = (font: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    return context.measureText('M').width; // Measure width of a single character
  }
  return 0;
};

const splitMessageIntoLines = (
  message: GameMessage,
  lineWidth: number,
  charWidth: number
): GameMessage[] => {
  const maxCharsPerLine = Math.floor(lineWidth / charWidth);
  const lines: GameMessage[] = [];
  let currentLine: TextFragment[] = [];
  let currentLineLength = 0;

  message.parsed.forEach((fragment) => {
    let content = fragment.content;
    while (content.length > 0) {
      const remainingChars = maxCharsPerLine - currentLineLength;
      const splitIndex = Math.min(remainingChars, content.length);
      
      const fragmentPart = content.substring(0, splitIndex);
      currentLine.push({ content: fragmentPart, ansi: fragment.ansi });
      currentLineLength += fragmentPart.length;

      if (currentLineLength >= maxCharsPerLine || splitIndex < content.length) {
        lines.push({
          line_number: message.line_number,
          timestamp: message.timestamp,
          raw: message.raw,
          parsed: currentLine,
        });
        currentLine = [];
        currentLineLength = 0;
      }

      content = content.substring(splitIndex);
    }
  });

  if (currentLine.length > 0) {
    lines.push({
      line_number: message.line_number,
      timestamp: message.timestamp,
      raw: message.raw,
      parsed: currentLine,
    });
  }

  return lines;
};

export const ConsoleTile: TileComponentType = () => {
  const { history } = useGameSocket();
  const { settings } = useSettings();
  const [consoleWidth, setConsoleWidth] = useState<number>(1000);
  const virtualListRef = useRef<List>(null);  

  const characterWidth = useMemo(() => {
    return measureMonospaceCharacterWidth(settings.output.fontType);
  }, [settings.output.fontType])

  useEffect(() => {
    const updateWidth = () => {
      if (!virtualListRef.current) return;
      setConsoleWidth(virtualListRef.current.props.width);
    };

    updateWidth();

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const consoleLineWidth = useMemo(() => {
    if (consoleWidth <= characterWidth) return settings.output.lineWidth * characterWidth;
    return Math.min(settings.output.lineWidth * characterWidth, consoleWidth);
  }, [settings.output.lineWidth, consoleWidth, characterWidth]);

  const consoleRows = useMemo(() => {
    return history.flatMap((message) =>
      splitMessageIntoLines(message, consoleLineWidth, characterWidth)
    );
  }, [history, consoleLineWidth]);

  // When history updates, send us to the bottom
  useEffect(() => {
    if (!virtualListRef.current) return;
    if (!settings.autoscroll) return;
    virtualListRef.current.scrollToRow(consoleRows.length - 1);
  }, [consoleRows]);

  function rowRenderer(params: any) {
    const gameMessage = consoleRows[params.index];
    return (
      <div key={params.key} style={params.style}>
        {gameMessage.parsed.map((fragment, index) => (
          renderTextFragment(fragment, gameMessage.line_number, index)
        ))}
      </div>
    );
  }
  
  return (
    <FontStyler 
      className={`console ${!settings.autoscroll ? 'scroll-disabled' : ''}`}
      settings={settings.output}>
      <AutoSizer>
        {({height, width}) => (
          <List
            ref={virtualListRef}
            height={height}
            rowCount={consoleRows.length}
            rowRenderer={rowRenderer}
            rowHeight={settings.output.fontSize * 1.1}
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
    onClick: (setSettings: (newSettings: Settings) => void) => {
      const newSettings = deepClone(settings);
      newSettings.input_echo = !settings.input_echo;
      setSettings(newSettings);
    },
    text: 'Echo',
    color: !settings.input_echo ? 'info' : 'warning'
  },
  {
    onClick: (setSettings: (newSettings: Settings) => void) => {
      const newSettings = deepClone(settings);
      newSettings.autoscroll = !settings.autoscroll;
      setSettings(newSettings);
    },
    text: settings.autoscroll ? "Pause Scroll" : "Resume Scroll",
    color: settings.autoscroll ? 'info' : 'warning'
  },
];

export default ConsoleTile;