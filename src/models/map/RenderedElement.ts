import Exit from "./Exit";
import Room from "./Room";
import doorSvgContent from '../../assets/map/door.svg';

export abstract class RenderedElement {
  abstract renderPriority: number;
  abstract onHover(): string;
  abstract render(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): void;
  abstract minX(): number;
  abstract maxX(): number;
  abstract minY(): number;
  abstract maxY(): number;
}

export class RenderedRoom implements RenderedElement {
  renderPriority = 10;
  data: Room;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(room: Room, gridSize: number) {
    this.data = room;

    // Generate display data from room:
    const MARGIN = 12;
    let [mapX, mapY] = room.location.toCanvas(gridSize);
    this.x = mapX + MARGIN;
    this.y = mapY + MARGIN;
    this.width = gridSize - (MARGIN * 2);
    this.height = gridSize - (MARGIN * 2);
  }

  onHover(): string {
    return this.data.name;
  }

  render(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    context.fillStyle = '#fff';
    context.fillRect(
      this.x - offsetX, this.y - offsetY,
      this.width, this.height
    );
  }

  minX(): number {
    return this.x;
  }

  maxX(): number {
    return this.x + this.width;
  }

  minY(): number {
    return this.y;
  }

  maxY(): number {
    return this.y + this.height;
  }
}

export class RenderedExit implements RenderedElement {
  renderPriority = 1;
  data: Exit[];
  points: {x: number, y: number}[];

  constructor(fromRoom: Room, toRoom: Room, gridSize: number) {
    // This extrapolates the proper exits from the rooms.
    this.data = [];
    this.data = [...this.data, ...fromRoom.exits.filter(e => e.to === toRoom.id)];
    this.data = [...this.data, ...toRoom.exits.filter(e => e.to === fromRoom.id)];
    
    // Generate display data from exit:
    this.points = [];
    const MARGIN = 12;
    const EXIT_WIDTH = 12;

    let [mapX, mapY] = fromRoom.location.toCanvas(gridSize);
    let [targetMapX, targetMapY] = toRoom.location.toCanvas(gridSize);

    if (this.data[0].name === 'north') {
      const centerX = mapX + (gridSize / 2);
      this.points.push({x: centerX - (EXIT_WIDTH / 2), y: mapY + MARGIN});
      this.points.push({x: centerX + (EXIT_WIDTH / 2), y: mapY + MARGIN});
      
      this.points.push({x: centerX + (EXIT_WIDTH / 2), y: targetMapY + gridSize - MARGIN});
      this.points.push({x: centerX - (EXIT_WIDTH / 2), y: targetMapY + gridSize - MARGIN});
    }
    if (this.data[0].name === 'south') {
      const centerX = mapX + (gridSize / 2);
      this.points.push({x: centerX - (EXIT_WIDTH / 2), y: mapY + gridSize - MARGIN});
      this.points.push({x: centerX + (EXIT_WIDTH / 2), y: mapY + gridSize - MARGIN});

      this.points.push({x: centerX + (EXIT_WIDTH / 2), y: targetMapY + MARGIN});
      this.points.push({x: centerX - (EXIT_WIDTH / 2), y: targetMapY + MARGIN});
    }
    if (this.data[0].name === 'east') {
      const centerY = mapY + (gridSize / 2);
      this.points.push({x: mapX + gridSize - MARGIN, y: centerY - (EXIT_WIDTH / 2)});
      this.points.push({x: mapX + gridSize - MARGIN, y: centerY + (EXIT_WIDTH / 2)});

      this.points.push({x: targetMapX + MARGIN, y: centerY + (EXIT_WIDTH / 2)});
      this.points.push({x: targetMapX + MARGIN, y: centerY - (EXIT_WIDTH / 2)});
    }
    if (this.data[0].name === 'west') {
      const centerY = mapY + (gridSize / 2);
      this.points.push({x: mapX + MARGIN, y: centerY - (EXIT_WIDTH / 2)});
      this.points.push({x: mapX + MARGIN, y: centerY + (EXIT_WIDTH / 2)});

      this.points.push({x: targetMapX + gridSize - MARGIN, y: centerY + (EXIT_WIDTH / 2)});
      this.points.push({x: targetMapX + gridSize - MARGIN, y: centerY - (EXIT_WIDTH / 2)});
    }

    const THINNESS = 1.6;
    if (this.data[0].name === 'northeast') {
      this.points.push({x: mapX + gridSize - MARGIN - (EXIT_WIDTH / THINNESS), y: mapY + MARGIN});
      this.points.push({x: mapX + gridSize - MARGIN, y: mapY + MARGIN}); // Room Corner
      this.points.push({x: mapX + gridSize - MARGIN, y: mapY + MARGIN + (EXIT_WIDTH / THINNESS)});
      
      this.points.push({x: targetMapX + MARGIN + (EXIT_WIDTH / THINNESS), y: targetMapY + gridSize - MARGIN});
      this.points.push({x: targetMapX + MARGIN, y: targetMapY + gridSize - MARGIN}); // Room Corner
      this.points.push({x: targetMapX + MARGIN, y: targetMapY + gridSize - MARGIN - (EXIT_WIDTH / THINNESS)});
    }

    if (this.data[0].name === 'southeast') {
      this.points.push({x: mapX + gridSize - MARGIN - (EXIT_WIDTH / THINNESS), y: mapY + gridSize - MARGIN});
      this.points.push({x: mapX + gridSize - MARGIN, y: mapY + gridSize - MARGIN}); // Room Corner
      this.points.push({x: mapX + gridSize - MARGIN, y: mapY + gridSize - MARGIN - (EXIT_WIDTH / THINNESS)});

      this.points.push({x: targetMapX + MARGIN + (EXIT_WIDTH / THINNESS), y: targetMapY + MARGIN});
      this.points.push({x: targetMapX + MARGIN, y: targetMapY + MARGIN}); // Room Corner
      this.points.push({x: targetMapX + MARGIN, y: targetMapY + MARGIN + (EXIT_WIDTH / THINNESS)});
    }

    if (this.data[0].name === 'southwest') {
      this.points.push({x: mapX + MARGIN, y: mapY + gridSize - MARGIN - (EXIT_WIDTH / THINNESS)});
      this.points.push({x: mapX + MARGIN, y: mapY + gridSize - MARGIN}); // Room Corner
      this.points.push({x: mapX + MARGIN + (EXIT_WIDTH / THINNESS), y: mapY + gridSize - MARGIN});

      this.points.push({x: targetMapX + gridSize - MARGIN, y: targetMapY + MARGIN + (EXIT_WIDTH / THINNESS)});
      this.points.push({x: targetMapX + gridSize - MARGIN, y: targetMapY + MARGIN}); // Room Corner
      this.points.push({x: targetMapX + gridSize - MARGIN - (EXIT_WIDTH / THINNESS), y: targetMapY + MARGIN});
    }

    if (this.data[0].name === 'northwest') {
      this.points.push({x: mapX + MARGIN, y: mapY + MARGIN + (EXIT_WIDTH / THINNESS)});
      this.points.push({x: mapX + MARGIN, y: mapY + MARGIN});
      this.points.push({x: mapX + MARGIN + (EXIT_WIDTH / THINNESS), y: mapY + MARGIN});

      this.points.push({x: targetMapX + gridSize - MARGIN, y: targetMapY + gridSize - MARGIN - (EXIT_WIDTH / THINNESS)});
      this.points.push({x: targetMapX + gridSize - MARGIN, y: targetMapY + gridSize - MARGIN});
      this.points.push({x: targetMapX + gridSize - MARGIN - (EXIT_WIDTH / THINNESS), y: targetMapY + gridSize - MARGIN});
    }
  }
  onHover(): string {
    return '';
  }

  render(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    if (!this.points || this.points.length <= 0) return;

    context.fillStyle = '#fff';
    context.beginPath();
    context.moveTo(this.points[0].x - offsetX, this.points[0].y - offsetY);
    this.points.forEach((point) => {
      context.lineTo(point.x - offsetX, point.y - offsetY);
    });
    context.closePath();
    context.fill();

    if (this.data[0].isDoor) {
      const iconSize = 18;
      const img = new Image();
      img.src = doorSvgContent;

      // Draw the door icon
      const centerX = this.points.reduce((acc, point) => acc + point.x, 0) / this.points.length;
      const centerY = this.points.reduce((acc, point) => acc + point.y, 0) / this.points.length;

      context.fillStyle = 'white';
      context.fillRect(centerX - (iconSize / 2) - offsetX, centerY - (iconSize / 2) - offsetY, iconSize, iconSize);
      context.strokeStyle = 'black';
      context.strokeRect(centerX - (iconSize / 2) - offsetX, centerY - (iconSize / 2) - offsetY, iconSize, iconSize);

      img.onload = () => {
        context.drawImage(img, centerX - (iconSize / 2) - offsetX, centerY - (iconSize / 2) - offsetY, iconSize, iconSize);
      };
    }
  }

  minX(): number {
    if (!this.points || this.points.length <= 0) return 0;
    return this.points.reduce((min, point) => (point.x < min.x ? point : min), this.points[0]).x;
  }

  maxX(): number {
    if (!this.points || this.points.length <= 0) return 0;
    return this.points.reduce((max, point) => (point.x > max.x ? point : max), this.points[0]).x;
  }

  minY(): number {
    if (!this.points || this.points.length <= 0) return 0;
    return this.points.reduce((min, point) => (point.y < min.y ? point : min), this.points[0]).y;
  }

  maxY(): number {
    if (!this.points || this.points.length <= 0) return 0;
    return this.points.reduce((max, point) => (point.y > max.y ? point : max), this.points[0]).y;
  }
}

export default RenderedElement;