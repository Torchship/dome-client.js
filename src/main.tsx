import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

import {GameSocketProvider} from "./components/providers/GameSocketProvider.tsx";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameSocketProvider>
      <App />
    </GameSocketProvider>
  </React.StrictMode>,
);