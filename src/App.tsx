import React, {useState} from 'react';

import './App.css'
import ClientWindowManager from './components/ClientWindowManager';
import SettingsIcon from "./assets/settings.svg";
import { useGameSocket } from './components/providers/GameSocketProvider';

function App() {
  const { socket } = useGameSocket();
  const [consoleInput, setConsoleInput] = useState(''); 

  const sendInput = () => {
    socket?.emit('input', consoleInput);
    setConsoleInput('');
  };

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
          <textarea value={consoleInput} onChange={e => setConsoleInput(e.target.value)}/>
          <button id="send-button" onClick={sendInput}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;