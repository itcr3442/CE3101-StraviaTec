export enum RoleLevels {
    Athlete = 0,
    Organizer
}

export const allRoles = Object.values(RoleLevels)

export declare type RoleLevelType = keyof typeof RoleLevels;

export const countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/es.json"));

// export function getInstanceModal(modal: HTMLElement) {
//     return bootstrap.Modal.getInstance(modal)
// }

export enum Relationships {
    None,
    Self,
    Following,
    FollowedBy,
    BothFollowing,
}
export declare type RelationshipsType = keyof typeof Relationships;

export const maxImageSize: number = 4 * (10 ** 6);