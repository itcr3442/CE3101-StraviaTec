import { Relationships, RelationshipsType, RoleLevels, RoleLevelType } from '../constants/user.constants'
import { Country, newc_alpha2 } from './country'

// Interfaz que generalmente representa toda la información completa de un usuario
export interface User {
    username: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    country: Country,
    imageURL: string | null, // puede ser null porque un usuario puede no tener pfp
    type: RoleLevels
    age: number | null
    relationship: Relationships | null
}

// Esta interfaz es para recibir los responses del API cuando se hace GET de un usuario
export interface UserResp {
    username: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    nationality: string,
    type: RoleLevelType
    age: number,
    relationship: RelationshipsType
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

export function resp2user(userResp: UserResp): User {
    let birthDate = new Date(userResp.birthDate)

    let alpha2: string = userResp.nationality
    let country: Country = newc_alpha2(alpha2)

    let type: RoleLevels = RoleLevels[userResp.type]
    let relationship: Relationships = Relationships[userResp.relationship]

    return {
        username: userResp.username,
        firstName: userResp.firstName,
        lastName: userResp.lastName,
        birthDate,
        country,
        imageURL: null,
        type,
        age: userResp.age,
        relationship
    }

}