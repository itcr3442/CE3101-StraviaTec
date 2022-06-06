import { RaceCategoryType } from "../constants/races.constants";
import { Activity } from "./activity";
import { User } from "./user";


export interface Participants {
    category: RaceCategoryType,
    participants: User[]
}

export interface ParticipantsResp {
    category: RaceCategoryType,
    participants: number[]
}

export interface Positions {
    category: RaceCategoryType,
    activities: { act: Activity, u: User }[]
}
export interface PositionsResp {
    category: RaceCategoryType,
    activities: number[]
}