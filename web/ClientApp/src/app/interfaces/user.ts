import { RoleLevels, RoleLevelType } from '../constants/user.constants'
import { Country } from './country'


export interface User {
    username: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    country: Country,
    imageURL: string | null,
    type: RoleLevels
}

export interface UserResp {
    username: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    nationality: string,
    type: RoleLevelType
}