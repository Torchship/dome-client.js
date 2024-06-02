import React, { useState, useRef, useEffect } from 'react';
import WorkersQuarter from '../../assets/sample_map.json';
import Area from '../../models/map/Area';
import Vector3, { toCanvas } from '../../models/map/Vector3';
import RenderedElement, { RenderedExit, RenderedRoom } from '../../models/map/RenderedElement';

const GRID_SIZE: number = 64;

function parseArea(data: any): Area {
  return {
    id: data.id,
    name: data.name,
    rooms: data.rooms.map((r: any) => ({
      ...r,
      location: new Vector3(r.location.x, r.location.y, r.location.z)
    }))
  };
};

interface MapRendererProps {
    viewportWidth: number;
    viewportHeight: number;
}
  
  const MapRenderer: React.FC<MapRendererProps> = ({viewportWidth, viewportHeight}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [mapBoundingBox, setMapBoundingBox] = useState({ x: -100, y: -100, width: 100, height: 100 });

    const [renderedElements, setRenderedElements] = useState<RenderedElement[]>([]);

    useEffect(() => {
      const area = parseArea(WorkersQuarter);
      const rooms = area.rooms.map(r => new RenderedRoom(r, GRID_SIZE));
      const exits: RenderedExit[] = [];
      for (let room of area.rooms) {
        for (let exit of room.exits) {
          if (exits.some(e => e.data.includes(exit))) continue;
          const toRoom = area.rooms.find(r => r.id === exit.to);
          if (!toRoom) continue;
          exits.push(new RenderedExit(room, toRoom, GRID_SIZE));
        }
      }

      setRenderedElements([...exits, ...rooms]);
    }, []);

    useEffect(() => {
      if (!renderedElements || renderedElements.length <= 0) return;

      const padding = {
        // x: (viewportWidth / 2) - (GRID_SIZE % (viewportWidth / 2)),
        // y: (viewportHeight / 2) - (GRID_SIZE % (viewportHeight / 2))
        x: 12 + (GRID_SIZE * 4),
        y: 12 + (GRID_SIZE * 4)
      };

      const x = renderedElements.reduce((min, item) => (item.minX() < min.minX() ? item : min), renderedElements[0]).minX() - padding.x
      const y = renderedElements.reduce((min, item) => (item.minY() < min.minY() ? item : min), renderedElements[0]).minY() - padding.y;
      setMapBoundingBox({
        x,
        y,
        width: Math.abs(x) + Math.abs(renderedElements.reduce((min, item) => (item.maxX() < min.maxX() ? item : min), renderedElements[0]).maxX()) + padding.x,
        height: Math.abs(y) + Math.abs(renderedElements.reduce((min, item) => (item.maxY() < min.maxY() ? item : min), renderedElements[0]).maxY()) + padding.y
      })
    }, [renderedElements]);
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const context = canvas.getContext('2d');
      if (!context) return;
  
      const draw = () => {
        // Clear the canvas
        context.clearRect(0, 0, viewportWidth, viewportHeight);
  
        // Save context state
        context.save();
  
        // Draw the background
        context.fillStyle = '#5693BA';
        context.fillRect(
          mapBoundingBox.x - offset.x,
          mapBoundingBox.y - offset.y,
          mapBoundingBox.width, 
          mapBoundingBox.height);
  
        // Function to draw a dot
        const drawDot = (x: number, y: number) => {
          context.beginPath();
          context.arc(x - offset.x, y - offset.y, 1, 0, Math.PI * 2);
          context.fillStyle = '#A6C9DC';
          context.fill();
          context.closePath();
        };
  
        for (let x = mapBoundingBox.x + GRID_SIZE; x <= mapBoundingBox.width + mapBoundingBox.x; x += GRID_SIZE) {
          for (let y = mapBoundingBox.y + GRID_SIZE; y <= mapBoundingBox.height + mapBoundingBox.y; y += GRID_SIZE) {
            drawDot(x, y);
          }
        }
        
        renderedElements.forEach(ro => ro.render(context, offset.x, offset.y));

        // Draw vertical lines
        for (
          let x = mapBoundingBox.x + (GRID_SIZE / 2);
          x <= mapBoundingBox.width + mapBoundingBox.x;
          x += GRID_SIZE
        ) {
          context.strokeStyle = 'rgba(166, 201, 220, 0.24)';
          context.beginPath();
          context.moveTo(x - offset.x, mapBoundingBox.y - offset.y);
          context.lineTo(x - offset.x, mapBoundingBox.y + mapBoundingBox.height - offset.y);
          context.stroke();
        }

        // Draw horizontal lines
        for (
          let y = mapBoundingBox.y + (GRID_SIZE / 2);
          y <= mapBoundingBox.height + mapBoundingBox.y;
          y += GRID_SIZE
        ) {
          context.strokeStyle = 'rgba(166, 201, 220, 0.24)';
          context.beginPath();
          context.moveTo(mapBoundingBox.x - offset.x, y - offset.y);
          context.lineTo(mapBoundingBox.x + mapBoundingBox.width - offset.x, y - offset.y);
          context.stroke();
        }
      };
  
      draw();
    }, [offset, mapBoundingBox, viewportHeight, viewportWidth]);
  
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
    };
  
    const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setOffset((prevOffset) => ({
          x: prevOffset.x - dx,
          y: prevOffset.y - dy,
        }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };
  
    // const centerOnCoordinates = (x: number, y: number) => {
    //   setOffset({
    //     x: x - viewportWidth / 2,
    //     y: y - viewportHeight / 2,
    //   });
    // };
  
    return (
      <canvas
          ref={canvasRef}
          width={viewportWidth}
          height={viewportHeight}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
    );
  }

  export default MapRenderer;