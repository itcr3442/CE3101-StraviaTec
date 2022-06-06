import { AuthService } from "../services/auth.service";
import { User } from "./user";

export interface Comment {
    user: User,
    time: Date,
    content: string,
}


export interface CommentResp {
    user: number,
    time: string,
    content: string,
}