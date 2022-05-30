import { RaceStatuses, RaceTypes } from "../constants/races.constants";

//Esta interfaz se usa para recibir las carreras de la búsqueda de carreras por ID
export interface Race {
    name: string,
    start: Date,
    end: Date,
    type: RaceTypes,
    privateGroups: number[],
    price: number,
    status: RaceStatuses
}

