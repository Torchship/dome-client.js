import Exit from "./Exit";
import Vector3 from "./Vector3";

export interface Room {
    id: number;
    name: string;
    location: Vector3;
    exits: Exit[];
}

export default Room;