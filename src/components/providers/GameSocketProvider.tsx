// src/socketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useEditorManager, EditorWindowData } from './EditorManagerProvider';
import { deepClone } from '../../util';
import TextFragment from '../../parser/TextFragment';
import AnsiState, { ANSI_NORMAL } from '../../parser/AnsiState';
import { parse } from '../../parser';


interface GameSocketContextProps {
  socket: Socket | null;
  history: GameMessage[];
  connectionState: 'connected' | 'disconnected';
  reconnect: () => void;
}

const GameSocketContext = createContext<GameSocketContextProps>({
  socket: null, history: [], connectionState: 'disconnected',
  reconnect: function (): void {
    throw new Error('Function not implemented.');
  }
});

export const useGameSocket = () => useContext(GameSocketContext);

interface GameSocketProviderProps {
  children: ReactNode;
}

export interface GameMessage {
  lineNumber: number;
  timestamp: number;
  raw: string;
  parsed: TextFragment[];
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
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected'>('disconnected');
  const buffer = useRef<string>("");
  const lastLine = useRef<number>(1);
  const openAnsiState = useRef<AnsiState>(ANSI_NORMAL);

  function connect(): Socket {
    const newSocket = io('ws://localhost:3000'); // Replace with your server URL

    newSocket.on('connect', () => {
      setConnectionState('connected');
    });

    newSocket.on('disconnect', () => {
      setConnectionState('disconnected');
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
            spawnEditor?.(
              mode.current.mode, 
              mode.current.buffer, 
              mode.current.params, 
              {
                label: mode.current.params['upload'], 
                callback: (editor: EditorWindowData) => {
                  newSocket.emit('input', editor.saveCommand?.label);
                  editor.content
                    .split(/\r?\n/)
                    .forEach(line => newSocket.emit('input', line));
                  newSocket.emit('input', ".");
                }
              }
            );
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

        const result = parse(line, openAnsiState.current);
        openAnsiState.current = result.openAnsiState;

        // FIX: This guarantees empty lines will have a height when rendered
        if (result.stack.length === 1 && result.stack[0].content === '') {
          result.stack[0].content = ' ';
        }

        // Create a new object to represent this message
        const gameMessage: GameMessage = {
          lineNumber: lastLine.current++,
          timestamp: Date.now(),
          raw: line,
          parsed: result.stack
        };

        // Done parsing; add to history.
        setHistory((prevHistory) => [...prevHistory, gameMessage]);
      });
    });

    setSocket(newSocket);

    return newSocket;
  }

  function reconnect() {
    connect();
  }

  useEffect(() => {
    connect();

    return () => {
      socket?.close();
    };
  }, []);

  return (
    <GameSocketContext.Provider value={{ socket, history, connectionState, reconnect }}>
      {children}
    </GameSocketContext.Provider>
  );
};
