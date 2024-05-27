import './App.css'
import ClientWindowManager from './components/ClientWindowManager';
import SettingsModal from "./components/SettingsModal";
import ConsoleInput from './components/ConsoleInput';

function App() {
  return (
    <div id="app">
      <SettingsModal />
      <div id="window-manager">
        <ClientWindowManager />
      </div>
      <ConsoleInput />
    </div>
  )
}

export default App;