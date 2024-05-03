import { ChatType } from "./enums/chatType";
import { Message } from "./message";
import { User } from "./user";

export interface Chat {
    _id?: string;
    userIds: any[];
    chatType: ChatType;
    creator: User;
    messages: Message[];
}