import { countries } from "../constants/user.constants"
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

export interface Country {
    alpha2: string,
    official: string,
    flag: string,
}



export function newc_alpha2(alpha2: string): Country {
    return {
        alpha2,
        official: countries.getName(alpha2, "es"),
        flag: getUnicodeFlagIcon(alpha2),
    }
}