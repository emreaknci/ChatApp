import { ChatType } from "../models/enums/chatType";
import { ChatUserDto } from "./chatUserDto";
import { MessageDto } from "./messageDto";

export interface ChatDetailDto {
    _id: string;
    name: string;
    type: ChatType;
    users: ChatUserDto[];
    messages: MessageDto[];
    creator?: string;
    timestamp: Date | string;
}