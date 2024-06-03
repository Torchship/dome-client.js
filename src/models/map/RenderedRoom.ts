import RenderedElement from "./RenderedElement";
import Room from "./Room";

export class RenderedRoom implements RenderedElement {
  renderPriority = 10;
  data: Room;
  x: number;
  y: number;
  width: number;
  height: number;
  margin = 12;

  constructor(room: Room, gridSize: number) {
    this.data = room;

    // Generate display data from room:
    let [mapX, mapY] = room.location.toCanvas(gridSize);
    this.x = mapX + this.margin;
    this.y = mapY + this.margin;
    this.width = gridSize - (this.margin * 2);
    this.height = gridSize - (this.margin * 2);
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