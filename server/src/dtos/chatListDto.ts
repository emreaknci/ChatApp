import { ObjectId } from "mongoose";
import { ChatType } from "../models/chat";
import { MessageDto } from "./messageDto";

export type ChatListDto = {
    _id: ObjectId;
    name: string;
    type: ChatType;
    lastMessage: MessageDto | undefined;
};




