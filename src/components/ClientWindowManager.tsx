import React from 'react';
import { Mosaic, MosaicWindow, RemoveButton } from 'react-mosaic-component';

import { useGameSocket } from './providers/GameSocketProvider';
import 'react-mosaic-component/react-mosaic-component.css';
import './ClientWindowManager.css';

export type ViewId = 'console' | 'new';

const TITLE_MAP: Record<ViewId, string> = {
  console: 'Torchship Console',
  new: 'New Window',
};

export const ClientWindowManager: React.FC = () => {
  const { lines } = useGameSocket();
  
  return (
    <Mosaic<ViewId>
        renderTile={(id, path) => (
          <MosaicWindow<ViewId> 
            path={path} 
            createNode={() => 'new'} 
            title={TITLE_MAP[id]} 
            renderPreview={() => <div></div>}
            >
              <div className="console">
                {lines && lines.map((msg, index) => (
                  <div key={index}>{msg}</div>
                ))}
              </div>
            {/* <h1>{TITLE_MAP[id]}</h1> */}
          </MosaicWindow>
        )}
        initialValue={'console'}
      />
  );
};

export default ClientWindowManager;