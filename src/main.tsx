import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App.tsx';
import 'react-widgets/styles.css';
import './styles/global.css';
import './styles/scrollbar.css';

import {GameSocketProvider} from "./components/providers/GameSocketProvider.tsx";
import {SettingsProvider} from "./components/providers/SettingsProvider.tsx";
import { EditorManagerProvider } from './components/providers/EditorManagerProvider.tsx';
import { TileManagerProvider } from './components/providers/TileManagerProvider.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
    <EditorManagerProvider>
      <GameSocketProvider>
        <TileManagerProvider>
          <App />
        </TileManagerProvider>
      </GameSocketProvider>
    </EditorManagerProvider>
  </SettingsProvider>
);

Modal.setAppElement('#root');