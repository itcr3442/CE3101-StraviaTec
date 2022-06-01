import { race } from "rxjs";
import { ActivityType, ActivityTypeType } from "../constants/activity.constants";
import { RaceCategory, RaceCategoryType, RaceStatus, RaceStatusType } from "../constants/races.constants";

//Esta interfaz se usa para recibir las carreras de la búsqueda de carreras por ID
export interface Race {
    name: string,
    day: Date,
    type: ActivityType,
    privateGroups: number[],
    price: number,
    status: RaceStatus,
    categories: RaceCategory[]
}

// TODO: arreglar start/end -> day, +categories
export interface RaceResp {
    name: string,
    day: string,
    type: ActivityTypeType,
    privateGroups: number[],
    price: number,
    status: RaceStatusType,
    categories: RaceCategoryType[]
}

export function resp2race(raceResp: RaceResp): Race {
    let day = new Date(raceResp.day)
    let type: ActivityType = ActivityType[raceResp.type]
    let status: RaceStatus = RaceStatus[raceResp.status]
    let categories: RaceCategory[] = raceResp.categories.map((category: RaceCategoryType) => { return RaceCategory[category] })

    // Wait no hay que hacer un map
    // let categories: RaceCategory  = RaceCategory[raceResp.categories]

    return {
        name: raceResp.name,
        day,
        type,
        privateGroups: raceResp.privateGroups,
        price: raceResp.price,
        status,
        categories,
    }
}