import Exit from "./Exit";
import Room from "./Room";

export abstract class RenderedElement {
  abstract onHover(): string;
  abstract render(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): void;
}

export class RenderedRoom implements RenderedElement {
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
}

export class RenderedExit implements RenderedElement {
  data: Exit[];
  points: {x: number, y: number}[];

  constructor(fromRoom: Room, toRoom: Room, gridSize: number) {
    // This extrapolates the proper exits from the rooms.
    this.data = [];
    this.data = [...this.data, ...fromRoom.exits.filter(e => e.to === toRoom.id)];
    this.data = [...this.data, ...toRoom.exits.filter(e => e.to === fromRoom.id)];
    
    // Generate display data from exit:
    this.points = [];

  }
  onHover(): string {
    return '';
  }
  render(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    
  }
}

export default RenderedElement;