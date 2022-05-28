import { RoleLevels, RoleLevelType } from '../constants/user.constants'
import { Country } from './country'

// Interfaz que generalmente representa toda la información completa de un usuario
export interface User {
    username: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    country: Country,
    imageURL: string | null, // puede ser null porque un usuario puede no tener pfp
    type: RoleLevels
}

// Esta interfaz es para recibir los responses del API cuando se hace GET de un usuario
export interface UserResp {
    username: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    nationality: string,
    type: RoleLevelType
}


// Esta interfaz se usa para hacer PATCH requests que editan al mismo usuario
export interface NullableUser {
    username: string | null,
    firstName: string | null,
    lastName: string | null,
    birthDate: Date | null,
    country: Country | null,
    // imageURL: string | null,
    // type: RoleLevels 
}

export interface UserSearchByID {
    username:       string,
    firstName:      string,
    lastName:       string,
    birthDate:      Date,
    age:            number, 
    nationality:    string,
    relationship:   string
}