import React from 'react';

import './App.css'
import ClientWindowManager from './components/ClientWindowManager';
import SettingsIcon from "./assets/settings.svg";

function App() {
  return (
    <div id="app">
      <div id="window-manager">
        <ClientWindowManager />
      </div>
      <div id="input">
        <div className="input-container">
          <button id="options-button">
            <img src={SettingsIcon}></img>
          </button>
          <textarea/>
          <button id="send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;