// src/socketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';


interface GameSocketContextProps {
  socket: Socket | null;
  history: GameMessage[];
}

const GameSocketContext = createContext<GameSocketContextProps>({ socket: null, history: [] });

export const useGameSocket = () => useContext(GameSocketContext);

interface GameSocketProviderProps {
  children: ReactNode;
}

export interface GameMessage {
  line_number: number;
  timestamp: number;
  raw: string;
  parsed: TextFragment;
}

export interface TextFragment {
  content: string | TextFragment[];
  ansi?: AnsiState;
}

export const ANSI_NORMAL: AnsiState = {
  is_bold: false,
  is_underline: false,
  is_italic: false,
  foreground_color: 'normal',
  background_color: 'normal'
};

export interface AnsiState {
  is_bold: boolean;
  is_underline: boolean;
  is_italic: boolean;
  foreground_color: string;
  background_color: string;
}

export const GameSocketProvider: React.FC<GameSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [history, setHistory] = useState<GameMessage[]>([]);
  const buffer = useRef<string>("");
  const lastLine = useRef<number>(1);
  const openAnsiState = useRef<AnsiState>(ANSI_NORMAL);

  useEffect(() => {
    const newSocket = io('ws://localhost:3000'); // Replace with your server URL

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    newSocket.on('data', (data: string) => {
      buffer.current += data;

      // Split buffer on newlines
      const lines = buffer.current.split(/\r?\n/);

      // The last element in the array is either an incomplete line or an empty string
      buffer.current = lines.pop() || '';

      // Process each complete line
      lines.forEach(line => {
        // Parse the line...
        let c;
        let current_fragment: TextFragment = {content: ''};
        for (let i=0; i < line.length;i++) {
          c = line[i];
          if (c === '\x1b' && i + 1 < line.length && line[i+1] === '[') {
            // Beginning of ANSI sequence
            let sequences = [];
            let sequence = '';
            let ansi_char;
            let n = i + 2;
            for (n; n < line.length; n++) {
              ansi_char = line[n];
              if (ansi_char === ';' && sequence) {
                sequences.push(parseInt(sequence));
                sequence = '';
                continue;
              } else if (ansi_char === 'm') {
                // terminate the ansi look-ahead as we found a proper escape code
                sequences.push(parseInt(sequence));
                sequence = '';
                break;
              }

              // sequence builder; when we're not doing a mode operation add the cur char to our
              // active sequence
              sequence += ansi_char;
            }
            // Check to see if we actually ended at a valid ANSI sequence terminator
            if (ansi_char !== 'm' || sequences.length <= 0) {
              // We did not.
              current_fragment.content += c;
              continue;
            }

            // Move the index ahead to after the escape sequence
            i = n;

            // Use sequences to determine wtf we're doing...
            let new_ansi: AnsiState = {
              is_bold: openAnsiState.current.is_bold,
              is_italic: openAnsiState.current.is_italic,
              is_underline: openAnsiState.current.is_underline,
              foreground_color: openAnsiState.current.foreground_color,
              background_color: openAnsiState.current.background_color
            };

            if (sequences.length === 1 && sequences[0] === 0) {
              new_ansi = ANSI_NORMAL;
            } else if (sequences.length === 3 && sequences[0] === 38 && sequences[1] === 5) {
              // xterm 256 foreground
              const xtermCode = sequences[2];
              const index = xtermCode - 16;
              const r = Math.floor(index / 36) % 6 * 51;
              const g = Math.floor(index / 6) % 6 * 51;
              const b = index % 6 * 51;
              new_ansi.foreground_color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            } else {
              let color_code = sequences[0];
              if (sequences.length > 1) {
                color_code = sequences[1];
                // Hack to upgrade color codes to their more recent versions...
                if (sequences[0] === 0) color_code += 60;
              }

              switch (color_code) {
                case 1: // Bold
                  new_ansi.is_bold = true;
                  break;
                case 2: // Faint
                  break;
                case 3: // Italic
                  new_ansi.is_italic = true;
                  break;
                case 4: // Underline
                  new_ansi.is_underline = true;
                  break;
                case 31: // Red
                  new_ansi.foreground_color = '#900';
                  break;
                case 32: // Green
                  new_ansi.foreground_color = '#090';
                  break;
                case 33: // Yellow
                  new_ansi.foreground_color = '#990';
                  break;
                case 34: // Blue
                  new_ansi.foreground_color = '#009';
                  break;
                case 35: // Magenta
                  new_ansi.foreground_color = '#909';
                  break;
                case 36: // Cyan
                  new_ansi.foreground_color = '#099';
                  break;
                case 37: // White
                  new_ansi.foreground_color = 'white';
                  break;
                case 91: // Bright Red
                  new_ansi.foreground_color = '#F00';
                  break;
                case 92: // Bright Green
                  new_ansi.foreground_color = '#0f0';
                  break;
                case 93: // Bright Yellow
                  new_ansi.foreground_color = '#ff0';
                  break;
                case 94: // Bright Blue
                  new_ansi.foreground_color = '#00f';
                  break;
                case 95: // Bright Magenta
                  new_ansi.foreground_color = '#f0f';
                  break;
                case 96: // Bright Cyan
                  new_ansi.foreground_color = '#0ff';
                  break;
                default:
                  console.log(`wtf sequence is ${sequences}?`);
                  new_ansi.foreground_color = 'yellow';
                  break;
              }
            }

            // Append to fragment
            if (typeof current_fragment.content === 'string') {
              if (current_fragment.content) {
                current_fragment.content = [
                  {content: current_fragment.content, ansi: openAnsiState.current}
                ];
              } else {
                current_fragment.content = [];
              }
            }

            // Append new fragment chunk
            current_fragment.content.push({
              content: '',
              ansi: new_ansi
            });

            // Bleed the state
            openAnsiState.current = new_ansi;

            // Move to the next operation
            continue;
          }

          if (typeof current_fragment.content === 'string') {
            current_fragment.content += c;
          } else {
            current_fragment.content[current_fragment.content.length - 1].content += c;
          }
        }

        // OPTIMIZATION: Kill any empty trailing nodes
        if (typeof current_fragment.content !== 'string' && !current_fragment.content[current_fragment.content.length - 1].content) {
          current_fragment.content.pop();
        }

        // Create a new object to represent this message
        const gameMessage: GameMessage = {
          line_number: lastLine.current++,
          timestamp: Date.now(),
          raw: line,
          parsed: current_fragment
        };

        // Done parsing; add to history.
        setHistory((prevHistory) => [...prevHistory, gameMessage]);
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <GameSocketContext.Provider value={{ socket, history }}>
      {children}
    </GameSocketContext.Provider>
  );
};
