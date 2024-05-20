// src/socketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameSocketContextProps {
  socket: Socket | null;
  lines: string[];
}

const GameSocketContext = createContext<GameSocketContextProps>({ socket: null, lines: [] });

export const useGameSocket = () => useContext(GameSocketContext);

interface GameSocketProviderProps {
  children: ReactNode;
}

export const GameSocketProvider: React.FC<GameSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('ws://localhost:3000'); // Replace with your server URL

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    newSocket.on('data', (data: string) => {
      setLines((prevLines) => [...prevLines, ...data.split(/\r?\n/)]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <GameSocketContext.Provider value={{ socket, lines }}>
      {children}
    </GameSocketContext.Provider>
  );
};
