export abstract class RenderedElement {
  abstract renderPriority: number;
  abstract onHover(): string;
  abstract render(context: CanvasRenderingContext2D, offsetX: number, offsetY: number): void;
  abstract minX(): number;
  abstract maxX(): number;
  abstract minY(): number;
  abstract maxY(): number;
}

export default RenderedElement;