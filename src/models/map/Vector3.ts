export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toCanvas(gridSize: number): number[] {
        return [
            this.x * gridSize,      // X coordinate
            this.y * gridSize * -1, // Y coordinate
        ];
    }
}

/* 
 * Converts game coordinates to canvas coordinates
 */
export function toCanvas(vector: Vector3, gridSize: number): number[] {
    return [
        vector.x * gridSize,      // X coordinate
        vector.y * gridSize * -1, // Y coordinate
    ];
}

export default Vector3;