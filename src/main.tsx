import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App.tsx';
import './styles/global.css';
import './styles/scrollbar.css';

import {GameSocketProvider} from "./components/providers/GameSocketProvider.tsx";
import {SettingsProvider} from "./components/providers/SettingsProvider.tsx";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <GameSocketProvider>
        <App />
      </GameSocketProvider>
    </SettingsProvider>
  </React.StrictMode>
);

Modal.setAppElement('#root');