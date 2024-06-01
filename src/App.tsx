import './App.css'
import SettingsModal from "./components/SettingsModal";
import ConsoleInput from './components/ConsoleInput';
import TileManager from './components/TileManager';

function App() {
  return (
    <div id="app">
      <SettingsModal />
      <div id="window-manager">
        <TileManager/>
      </div>
      <ConsoleInput />
    </div>
  )
}

export default App;