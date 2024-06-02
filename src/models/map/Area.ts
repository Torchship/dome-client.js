import Room from "./Room";

export interface Area {
    id: number;
    name: string;
    rooms: Room[];
}

export default Area;