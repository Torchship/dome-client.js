import { Mosaic, MosaicBranch, MosaicNode, MosaicWindow } from "react-mosaic-component";
import { useTileManager } from "./providers/TileManagerProvider";

import 'react-mosaic-component/react-mosaic-component.css';
import './TileManager.css';
import { TileModel } from "../models/TileModel";

export const TileManager: React.FC = () => {
  const {nodeGraph, updateNodeGraph, getViewModel} = useTileManager();

  const onChange = (currentNode: MosaicNode<number> | null) => {
    updateNodeGraph(currentNode);
  };

  const renderToolbar = (id: number, viewModel: TileModel) => {
    return (
      <div className="window-toolbar">
        {viewModel.title}
      </div>
    )
  };

  const renderTile = (id: number, path: MosaicBranch[]) => {
    const viewModel = getViewModel(id);
    const Component = viewModel.component;

    return (
      <MosaicWindow<number>
        path={path}
        title={viewModel.title}
        renderPreview={() => <div></div>}
        renderToolbar={() => renderToolbar(id, viewModel)}>
          <Component state={viewModel.persistentData}/>
        </MosaicWindow>
    );
  };

  return (
    <Mosaic<number>
        value={nodeGraph}
        onChange={onChange}
        renderTile={renderTile}
      />
  );
} ;

export default TileManager;