import { ActivityType } from "../constants/activity.constants";
import { ChallengeStatus } from "../constants/challengers.constants";

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

