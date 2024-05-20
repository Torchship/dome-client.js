import React, {useState} from 'react';

import './App.css'
import ClientWindowManager from './components/ClientWindowManager';
import SettingsIcon from "./assets/settings.svg";
import { Key } from 'ts-keycode-enum';
import { useGameSocket } from './components/providers/GameSocketProvider';

function isEmptyOrSpaces(str){
  return str === null || str.match(/^ *$/) !== null;
}

function App() {
  const { socket } = useGameSocket();
  const [consoleInput, setConsoleInput] = useState(''); 

  const sendInput = () => {
    if (isEmptyOrSpaces(consoleInput))
      return;
    
    socket?.emit('input', consoleInput);
    setConsoleInput('');
  };

  const onKeyDown = (e) => {
    if (e.keyCode === Key.Enter && e.shiftKey === false) {
      e.preventDefault();
      sendInput();
    } else if (e.keyCode == Key.UpArrow && e.shiftKey === false) {
      // Go up to previous input
    } else if (e.keyCode == Key.DownArrow && e.shiftKey === false) {
      // Go to more recent input
    }
  }

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
          <button id="send-button" onClick={sendInput} onKeyDown={onKeyDown}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;