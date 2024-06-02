import React, { useState, useRef, useEffect } from 'react';
import WorkersQuarter from '../../assets/sample_map.json';
import Area from '../../models/map/Area';
import Vector3, { toCanvas } from '../../models/map/Vector3';
import { RenderedExit, RenderedRoom } from '../../models/map/RenderedElement';

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
    const [mapSize] = useState({ width: 2000, height: 2000 });

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
        context.fillRect(-offset.x, -offset.y, mapSize.width, mapSize.height);
  
        // Function to draw a dot
        const drawDot = (x: number, y: number) => {
          context.beginPath();
          context.arc(x - offset.x, y - offset.y, 1, 0, Math.PI * 2);
          context.fillStyle = '#A6C9DC';
          context.fill();
          context.closePath();
        };
  
        for (let x = GRID_SIZE; x <= mapSize.width - GRID_SIZE; x += GRID_SIZE) {
          for (let y = GRID_SIZE; y <= mapSize.height - GRID_SIZE; y += GRID_SIZE) {
            drawDot(x, y);
          }
        }

        exits.forEach(exit => exit.render(context, offset.x, offset.y));
        rooms.forEach(room => room.render(context, offset.x, offset.y));
      };
  
      draw();
    }, [offset, mapSize, viewportHeight, viewportWidth]);
  
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