import React, {useState} from 'react';

import './App.css'
import ClientWindowManager from './components/ClientWindowManager';
import SettingsModal from "./components/SettingsModal";
import SettingsIcon from "./assets/settings.svg";
import { Key } from 'ts-keycode-enum';
import { useGameSocket } from './components/providers/GameSocketProvider';
import {useSettings} from './components/providers/SettingsProvider';
import FontStyler from './components/FontStyler';

function isEmptyOrSpaces(str: string){
  return str === null || str.match(/^ *$/) !== null;
}

function App() {
  const { socket } = useGameSocket();
  const [consoleInput, setConsoleInput] = useState('');
  const {isSettingsOpen, setSettingsOpen, settings} = useSettings(); 

  const sendInput = () => {
    if (isEmptyOrSpaces(consoleInput))
      return;

    socket?.emit('input', consoleInput);
    setConsoleInput('');
  };

  const onKeyDown = (e) => {
    if (e.keyCode === Key.Enter) {
      e.preventDefault();
      sendInput();
    } else if (e.keyCode == Key.UpArrow && e.shiftKey === false) {
      // Go up to previous input
    } else if (e.keyCode == Key.DownArrow && e.shiftKey === false) {
      // Go to more recent input
    }
  }

  const openSettings = () => {
    if (isSettingsOpen)
      return;
    if (!setSettingsOpen)
      return;
    setSettingsOpen(true);
  };

  return (
    <div id="app">
      <SettingsModal />
      <div id="window-manager">
        <ClientWindowManager />
      </div>
      <div id="input">
        <div className="input-container">
          <button id="options-button" onClick={openSettings}>
            <img src={SettingsIcon}></img>
          </button>
          <FontStyler settings={settings.input}>
            <textarea value={consoleInput} onChange={e => setConsoleInput(e.target.value)} onKeyDown={onKeyDown}/>
          </FontStyler>
          <button id="send-button" onClick={sendInput}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;