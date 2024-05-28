import React, {useEffect, useState} from 'react';
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
  const [consoleHistory, setConsoleHistory] = useState<string[]>([]);
  const [consoleHistorySelector, setConsoleHistorySelector] = useState<number>(-1);

  // Load our input history from local storage.
  useEffect(() => {
    const cachedHistory = localStorage.getItem('input-history');
    if (!cachedHistory) return;
    setConsoleHistory(JSON.parse(cachedHistory));
  }, []);

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

    setConsoleHistory((prevValue) => [consoleInput, ...prevValue].slice(0, 100));
    localStorage.setItem('input-history', JSON.stringify(consoleHistory));
    socket?.emit('input', consoleInput);
    setConsoleInput('');
    setConsoleHistorySelector(-1);
  };
  
  const onKeyDown = (e) => {
    if (e.keyCode === Key.Enter) {
      e.preventDefault();
      sendInput();
    } else if (e.keyCode == Key.UpArrow && e.shiftKey === false) {
      // Go up to previous input
      const selector = consoleHistorySelector + 1;
      if (selector > consoleHistory.length - 1) return;
      setConsoleHistorySelector(selector);
      setConsoleInput(consoleHistory[selector]);
    } else if (e.keyCode == Key.DownArrow && e.shiftKey === false) {
      // Go to more recent input
      const selector = consoleHistorySelector - 1;
      if (selector < 0) {
        setConsoleInput('');
        return;
      }
      setConsoleHistorySelector(selector);
      setConsoleInput(consoleHistory[selector]);
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