export enum ChallengeStatus {
    NotRegistered,
    Registered, 
    Completed
}

export declare type ChallengeStatusType = keyof typeof ChallengeStatus;