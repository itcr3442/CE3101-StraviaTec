import { ActivityType, ActivityTypeType } from "../constants/activity.constants";

export interface Activity {
    user: number,
    start: Date,
    end: Date,
    length: number,
    type: ActivityType
}


export interface ActivityResp {
    user: number,
    start: string,
    end: string,
    length: number,
    type: ActivityTypeType
}

export function resp2activity(activityResp: ActivityResp): Activity {
    let startDate = new Date(activityResp.start)
    let endDate = new Date(activityResp.end)
    let type: ActivityType = ActivityType[activityResp.type]

    return {
        user: activityResp.user,
        start: startDate,
        end: endDate,
        length: activityResp.length,
        type: type
    }
}
