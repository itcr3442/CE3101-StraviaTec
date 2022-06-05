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

/*
export function groupResp2GroupDisplay(groupResp: GroupResp, authService: AuthService): GroupSearchDisplay {
    let groupAdmin!: User;
    authService.getUser(groupResp.admin)
        .subscribe((user: User | null) => {
        if (user) {
            console.log("getPageUsers res:", user);
            groupAdmin = user;
        }})

    return {
        name: groupResp.name,
        admin: groupAdmin.firstName + " " + groupAdmin.lastName,
        members: groupResp.members,
        amMember: groupResp.amMember,
    }

}
*/


