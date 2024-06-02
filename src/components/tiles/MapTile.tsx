
import { AutoSizer } from 'react-virtualized';
import TileComponentType from '../TileComponent';

import './MapTile.css';
import MapRenderer from '../map/MapRenderer';

export const MapTile: TileComponentType = () => {
  return (
    <AutoSizer>
      {({height, width}) => (
        <MapRenderer viewportWidth={width} viewportHeight={height} />
      )}
    </AutoSizer>
  );
};

export default MapTile;