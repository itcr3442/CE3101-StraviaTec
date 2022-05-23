import { RoleLevels } from '../constants/user.constants'
import { Country } from './country'


export interface User {
    username: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    country: Country,
    password: string,
    imageURL: string | null,
    type: RoleLevels
}
