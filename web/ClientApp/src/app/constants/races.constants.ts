export enum RaceStatus {
    NotRegistered,
    WaitingConfirmation,
    Registered,
    Completed
}

export declare type RaceStatusType = keyof typeof RaceStatus;

export enum RaceCategory {
    Junior,
    Sub23,
    Open,
    Elite,
    MasterA,
    MasterB,
    MasterC,
}

export declare type RaceCategoryType = keyof typeof RaceCategory;
