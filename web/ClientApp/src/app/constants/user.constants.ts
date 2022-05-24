export enum RoleLevels {
    Athlete = 0,
    Organizer
}

export const allRoles = Object.values(RoleLevels)

export declare type RoleLevelType = keyof typeof RoleLevels;