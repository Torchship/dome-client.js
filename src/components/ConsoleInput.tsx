import React, {useState} from 'react';
import SettingsIcon from "../assets/settings.svg";
import { Key } from 'ts-keycode-enum';

import FontStyler from './FontStyler';
import Button from './Button';
import { useGameSocket } from './providers/GameSocketProvider';
import { useSettings } from './providers/SettingsProvider';

function isEmptyOrSpaces(str: string){
  return str === null || str.match(/^ *$/) !== null;
}

export const ConsoleInput: React.FC = () => {
  const { socket } = useGameSocket();
  const { isSettingsOpen, setSettingsOpen, settings } = useSettings();
  const [consoleInput, setConsoleInput] = useState('');

  const openSettings = () => {
    if (isSettingsOpen)
      return;
    if (!setSettingsOpen)
      return;
    setSettingsOpen(true);
  };
  
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
  
  return (
    <div id="input">
      <div className="input-container">
        <Button onClick={openSettings}>
          <img src={SettingsIcon}></img>
        </Button>
        <FontStyler settings={settings.input}>
          <textarea value={consoleInput} onChange={e => setConsoleInput(e.target.value)} onKeyDown={onKeyDown}/>
        </FontStyler>
        <Button onClick={sendInput}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ConsoleInput;