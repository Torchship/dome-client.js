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
  timestamp: number;
  raw: string;
  html: string;
}

export const GameSocketProvider: React.FC<GameSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [history, setHistory] = useState<GameMessage[]>([]);

  useEffect(() => {
    const newSocket = io('ws://localhost:3000'); // Replace with your server URL

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    newSocket.on('data', (data: string) => {
      data.split(/\r?\n/).forEach(line => {
        // Create a new object to represent this message
        const gameMessage: GameMessage = {
          timestamp: Date.now(),
          raw: line,
          html: line
        };

        // begin parsing it...
        // TODO: werk...

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
