import { countries } from "../constants/user.constants"
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

// incluye código alpha 2, nombre oficial y bandera unicode
export interface Country {
    alpha2: string,
    official: string,
    flag: string,
}

/**
 * Crear nuevo objeto Country a partir de código alpha2
 * @param alpha2: string
 * @returns Country objects
 */
export function newc_alpha2(alpha2: string): Country {
    return {
        alpha2,
        official: countries.getName(alpha2, "es"),
        flag: getUnicodeFlagIcon(alpha2),
    }
}