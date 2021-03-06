import { race } from "rxjs";
import { ActivityType, ActivityTypeType } from "../constants/activity.constants";
import { RaceCategory, RaceCategoryType, RaceStatus, RaceStatusType } from "../constants/races.constants";
import { Sponsor } from "./sponsor";

//Esta interfaz se usa para recibir las carreras de la búsqueda de carreras por ID
export interface Race {
    name: string,
    day: Date,
    type: ActivityType,
    privateGroups: number[],
    price: number,
    status: RaceStatus,
    categories: RaceCategory[],
    bankAccounts: string[],
    sponsors: number[]
}

export interface NullableRace {
    name: string | null,
    day: Date | null,
    type: ActivityType | null,
    privateGroups: number[] | null,
    categories: RaceCategoryType[] | null,
    price: number | null,
    bankAccounts: string[] | null,
    sponsors: number[] | null
}

// TODO: arreglar start/end -> day, +categories
export interface RaceResp {
    name: string,
    day: string,
    type: ActivityTypeType,
    privateGroups: number[],
    price: number,
    categories: RaceCategoryType[],
    bankAccounts: string[],
    sponsors: number[],
    status: RaceStatusType,
}

export interface LeaderboardRow {
    activity: number,
    seconds: number,
    length: number
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
        categories,
        bankAccounts: raceResp.bankAccounts,
        sponsors: raceResp.sponsors,
        status
    }
}

export function getUserCategory(userAge: number | null): string {
    if (userAge) {
        if (userAge < 15) {
            return "Junior"
        } else if ((15 <= userAge) && (userAge <= 23)) {
            return "Sub23"
        } else if ((24 <= userAge) && (userAge <= 30)) {
            return "Open"
        } else if ((31 <= userAge) && (userAge <= 40)) {
            return "MasterA"
        } else if ((41 <= userAge) && (userAge <= 50)) {
            return "MasterB"
        } else if ((51 <= userAge)) {
            return "MasterC"
        } else {
            return "Elite"
        }
    }
    return "Elite"
}

export function getUserCategoryType(userAge: number | null): RaceCategory {
    if (userAge) {
        if (userAge < 15) {
            return RaceCategory.Junior
        } else if ((15 <= userAge) && (userAge <= 23)) {
            return RaceCategory.Sub23
        } else if ((24 <= userAge) && (userAge <= 30)) {
            return RaceCategory.Open
        } else if ((31 <= userAge) && (userAge <= 40)) {
            return RaceCategory.MasterA
        } else if ((41 <= userAge) && (userAge <= 50)) {
            return RaceCategory.MasterB
        } else if ((51 <= userAge)) {
            return RaceCategory.MasterC
        } else {
            return RaceCategory.Elite
        }
    }
    return RaceCategory.Elite
}

