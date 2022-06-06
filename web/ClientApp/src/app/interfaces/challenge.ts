import { start } from "repl";
import { ActivityType, ActivityTypeType } from "../constants/activity.constants";
import { ChallengeStatus, ChallengeStatusType } from "../constants/challengers.constants";

//Esta interfaz se usa para recibir las carreras de la búsqueda de carreras por ID
export interface Challenge {
    name: string,
    start: Date,
    end: Date,
    type: ActivityType,
    goal: number,
    progress: number,
    remainingDays: number,
    privateGroups: number[],
    status: ChallengeStatus
}

export interface NullableChallenge {
    name: string | null,
    start: string | null,
    end: string | null,
    type: ActivityTypeType | null,
    goal: number | null,
    privateGroups: number[] | null,
}

export interface RespChallenge {
    name: string,
    start: string,
    end: string,
    type: ActivityTypeType,
    goal: number,
    progress: number,
    remainingDays: number,
    privateGroups: number[],
    status: ChallengeStatusType
}

export function resp2chall(challResp: RespChallenge): Challenge {
    let start = new Date(challResp.start)
    let end = new Date(challResp.end)
    let type: ActivityType = ActivityType[challResp.type]
    let status: ChallengeStatus = ChallengeStatus[challResp.status]

    return {
        name: challResp.name,
        start,
        end,
        type,
        goal: challResp.goal,
        progress: challResp.progress,
        remainingDays: challResp.remainingDays,
        privateGroups: challResp.privateGroups,
        status
    }
}


