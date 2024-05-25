// src/socketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useEditorManager } from './EditorManagerProvider';


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
  parsed: TextFragment[];
}

export interface TextFragment {
  content: string;
  ansi: AnsiState;
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

export interface SocketMode {
  mode: string;
  params: Record<string, string>;
  buffer: string;
}

export const GameSocketProvider: React.FC<GameSocketProviderProps> = ({ children }) => {
  const {spawnEditor} = useEditorManager();
  const [socket, setSocket] = useState<Socket | null>(null);
  const mode = useRef<SocketMode | null>(null);
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
        // Begin parsing line by line
        if (mode.current) {
          if (line === '.') {
            spawnEditor?.(mode.current.mode, mode.current.buffer, mode.current.params);
            mode.current = null;       
            return;
          }

          // We don't pass on additional lines to the reader socket...
          mode.current.buffer += line;
          mode.current.buffer += '\n';
          return;
        } 
        
        
        if (line.startsWith("#$#")) {          
          const oobRegex = /(?:(?:#\$# (\w+) )|([^:]+): (.*?)(?= [^:]+: |$))/g;
          let match;
          const newRecord: Record<string, string> = {};
          let new_mode = {mode: '', params: newRecord, buffer: ''};
          while ((match = oobRegex.exec(line)) !== null) {
            if (!new_mode.mode) new_mode.mode = match.slice(1)[0];
            else new_mode.params[match.slice(1)[1].trim()] = match.slice(1)[2].trim();
          }
          mode.current = new_mode;
          console.log(`OOB Edit Command Received: ${JSON.stringify(new_mode)}`);     
          return;
        }
        let c;
        const parsed_line: TextFragment[] = [{content: '', ansi: openAnsiState.current}];
        
        function cloneAnsi(ansi: AnsiState): AnsiState {
          return {
            is_bold: ansi.is_bold,
            is_italic: ansi.is_italic,
            is_underline: ansi.is_underline,
            foreground_color: ansi.foreground_color,
            background_color: ansi.background_color
          }
        }

        // Gets our latest/last fragment
        function last_fragment(): TextFragment {
          return parsed_line[parsed_line.length - 1];
        };

        function new_fragment(): TextFragment {
          return {
            content: '',
            ansi: cloneAnsi(openAnsiState.current)
          };
        };

        for (let i=0; i < line.length;i++) {
          c = line[i];
          const current_fragment = last_fragment();
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
              continue;
            }

            // Move the index ahead to after the escape sequence
            i = n;

            // Use sequences to determine wtf we're doing...
            let ansi_fragment = current_fragment;
            ansi_fragment.ansi = cloneAnsi(ansi_fragment.ansi);
            if (ansi_fragment.content.length > 0) {
              ansi_fragment = new_fragment();
              parsed_line.push(ansi_fragment);
            }

            if (sequences.length === 1 && sequences[0] === 0) {
              ansi_fragment.ansi = ANSI_NORMAL;
            } else if (sequences.length === 3 && sequences[0] === 38 && sequences[1] === 5) {
              // xterm 256 foreground
              const xtermCode = sequences[2];
              const index = xtermCode - 16;
              const r = Math.floor(index / 36) % 6 * 51;
              const g = Math.floor(index / 6) % 6 * 51;
              const b = index % 6 * 51;
              ansi_fragment.ansi.foreground_color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            } else {
              let color_code = sequences[0];
              if (sequences.length > 1) {
                color_code = sequences[1];
                // Hack to upgrade color codes to their more recent versions...
                if (sequences[0] === 0) color_code += 60;
              }

              switch (color_code) {
                case 1: // Bold
                  ansi_fragment.ansi.is_bold = true;
                  break;
                case 2: // Faint
                  break;
                case 3: // Italic
                  ansi_fragment.ansi.is_italic = true;
                  break;
                case 4: // Underline
                  ansi_fragment.ansi.is_underline = true;
                  break;
                case 31: // Red
                  ansi_fragment.ansi.foreground_color = '#900';
                  break;
                case 32: // Green
                  ansi_fragment.ansi.foreground_color = '#090';
                  break;
                case 33: // Yellow
                  ansi_fragment.ansi.foreground_color = '#990';
                  break;
                case 34: // Blue
                  ansi_fragment.ansi.foreground_color = '#009';
                  break;
                case 35: // Magenta
                  ansi_fragment.ansi.foreground_color = '#909';
                  break;
                case 36: // Cyan
                  ansi_fragment.ansi.foreground_color = '#099';
                  break;
                case 37: // White
                  ansi_fragment.ansi.foreground_color = 'white';
                  break;
                case 91: // Bright Red
                  ansi_fragment.ansi.foreground_color = '#F00';
                  break;
                case 92: // Bright Green
                  ansi_fragment.ansi.foreground_color = '#0f0';
                  break;
                case 93: // Bright Yellow
                  ansi_fragment.ansi.foreground_color = '#ff0';
                  break;
                case 94: // Bright Blue
                  ansi_fragment.ansi.foreground_color = '#00f';
                  break;
                case 95: // Bright Magenta
                  ansi_fragment.ansi.foreground_color = '#f0f';
                  break;
                case 96: // Bright Cyan
                  ansi_fragment.ansi.foreground_color = '#0ff';
                  break;
                default:
                  console.log(`wtf sequence is ${sequences}?`);
                  ansi_fragment.ansi.foreground_color = 'yellow';
                  break;
              }
            }

            // Bleed the state
            openAnsiState.current = ansi_fragment.ansi;

            // Move to the next operation
            continue;
          }

          current_fragment.content += c;
        }

        // FIX: This guarantees empty lines will have a height when rendered
        if (parsed_line.length === 1 && parsed_line[0].content === '') {
          parsed_line[0].content = ' ';
        }

        // Create a new object to represent this message
        const gameMessage: GameMessage = {
          line_number: lastLine.current++,
          timestamp: Date.now(),
          raw: line,
          parsed: parsed_line
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
