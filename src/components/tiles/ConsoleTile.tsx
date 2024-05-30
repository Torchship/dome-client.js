import React, {useRef, useEffect, useState, useMemo} from 'react';
import { GameMessage, useGameSocket } from '../providers/GameSocketProvider';
import TileComponentType from '../TileComponent';
import {List, AutoSizer} from 'react-virtualized';
import { useSettings } from '../providers/SettingsProvider';
import FontStyler from '../FontStyler';

import './ConsoleTile.css';
import 'react-virtualized/styles.css'; // only needs to be imported once
import Settings from '../../models/Settings';
import { deepClone, measureMonospaceCharacterWidth } from '../../util';
import Button from '../Button';
import { Theme } from '../../themes';
import TextFragment from '../../parser/TextFragment';

const renderTextFragment = (fragment: TextFragment, theme: Theme, line_number: number, index: number): JSX.Element => {
  let foregroundColor = fragment.ansi?.foreground_color;
  if (typeof foregroundColor === 'function') foregroundColor = foregroundColor(theme);
  let backgroundColor = fragment.ansi?.background_color;
  if (typeof backgroundColor === 'function') backgroundColor = backgroundColor(theme);

  const style: React.CSSProperties = {
      animation: fragment.ansi?.blink === 'slow'
        ? 'blinker 1s infinite'
        : fragment.ansi?.blink === 'rapid' 
          ? 'blinker 0.5s infinite'
          : 'none',
      fontWeight: fragment.ansi?.weight === 'faint' ? 100 : 'normal',
      color: foregroundColor || 'inherit',
      backgroundColor: backgroundColor || 'inherit',
      fontStyle: fragment.ansi?.is_italic ? 'italic' : 'normal',
      textDecoration: fragment.ansi?.is_underline ? `underline ${fragment.ansi?.foreground_color || 'inherit'}` : 'none',
  };

  return (
    <span key={`${line_number}-${index}`} style={style}>
        {fragment.content}
    </span>
  );
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
          lineNumber: message.lineNumber,
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
      lineNumber: message.lineNumber,
      timestamp: message.timestamp,
      raw: message.raw,
      parsed: currentLine,
    });
  }

  return lines;
};

export const ConsoleTile: TileComponentType = () => {
  const { history, connectionState } = useGameSocket();
  const { settings, getTheme } = useSettings();
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
          renderTextFragment(fragment, getTheme(), gameMessage.lineNumber, index)
        ))}
      </div>
    );
  }
  
  return (
    <>
      { connectionState === 'disconnected'
        ? (
          <div className="overlay">
            <div className="popup">
              <h3>Connection Lost</h3>
              <span>Would you like to reconnect?</span>
              <Button label="Reconnect"></Button>
            </div>
          </div>
          )
        : null
      }      
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
    </>
  );
}

ConsoleTile.title = "Torchship Console";
ConsoleTile.viewId = 'console';
ConsoleTile.getToolbarActions = (settings: Settings) => [
  {
    onClick: (setSettings: (newSettings: Settings) => void) => {
      const newSettings = deepClone(settings);
      newSettings.inputEcho = !settings.inputEcho;
      setSettings(newSettings);
    },
    text: 'Echo',
    color: !settings.inputEcho ? 'info' : 'warning'
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