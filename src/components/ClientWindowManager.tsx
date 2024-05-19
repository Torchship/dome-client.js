import React from 'react';
import { Mosaic, MosaicWindow, RemoveButton } from 'react-mosaic-component';

import 'react-mosaic-component/react-mosaic-component.css';
import './ClientWindowManager.css';
export type ViewId = 'console' | 'new';

const TITLE_MAP: Record<ViewId, string> = {
  console: 'Torchship Console',
  new: 'New Window',
};

export const ClientWindowManager: React.FC = () => {
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
                <div> _______             _         _     _                                    </div>
                <div>|__   __|   /////// | |       | |   (_)                                   </div>
                <div>   | | ___/// __ __ | |__  ___| |__  _ _ __                               </div>
                <div>   | |/ _ \| '__/ _|| '_ \/ __| '_ \| | '_ \                              </div>
                <div>   | | (_) | | | (_ | | | \__ \ | | | | |_) |                             </div>
                <div>   |_|\___/|_|  \__||_| |_|___/_| |_|_| .__/                              </div>
                <div>     ////            //##             | |                                 </div>
                <div>    ////             /####            |_|                                 </div>
                <div>    ////              /####                                               </div>
                <div>    ////              //###           ///##////#/#/#/##//                 </div>
                <div>    ////    ///##/    //###//// / //////  ##///#/#/#/##//                 </div>
                <div>    ////   /  ####/ _ //###//  /  // ///  ##/  ##/#/##//                  </div>
                <div>    ////   /  # ##/ _ //###// //  //  //  ##/ ##/#/##//                   </div>
                <div>    #///   /  /##//   //###//  / /// /// ##//##/#/##//                    </div>
                <div>    #///    ///# /    //### /// //  /// ##//##/#/##//                     </div>
                <div>    ##//              //###                                               </div>
                <div>    ##//              //###                                               </div>
                <div>     ##//             //##                                                </div>
                <div>     ##//             //##   A post-apocalyptic orbital roleplaying game. </div>
              </div>
            {/* <h1>{TITLE_MAP[id]}</h1> */}
          </MosaicWindow>
        )}
        initialValue={'console'}
      />
  );
};

export default ClientWindowManager;