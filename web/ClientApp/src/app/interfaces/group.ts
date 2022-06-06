import { group } from "console";
import { AuthService } from "../services/auth.service";
import { User } from "./user";

export interface GroupResp {
    name: string,
    admin: number,
    members: number[],
    amMember: boolean,
}

export interface GroupSearchDisplay {
    name: string,
    adminDisplay: string,
    members: number[],
    amMember: boolean,
}


