import { RoleLevels } from '../constants/user.constants'
import { Country } from './country'


export interface User {
    name: string,
    lastName: string,
    birthDate: Date,
    country: Country,
    password: string,
    imageURL: string | null,
    type: RoleLevels
}
