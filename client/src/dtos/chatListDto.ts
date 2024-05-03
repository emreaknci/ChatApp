import { ChatType } from "../models/enums/chatType";
import { MessageDto } from "./messageDto";

export interface ChatListDto {
    _id: string;
    name: string;
    type: ChatType;
    lastMessage: MessageDto | undefined;
}

