import { ObjectId } from "mongoose";
import { ChatType } from "../models/chat";
import { MessageDto } from "./messageDto";

export type ChatDetailDto = {
    _id: ObjectId;
    name: string;
    type: ChatType;
    users: ChatUserDto[];
    messages: MessageDto[];
    creator: ObjectId;
    timestamp: Date;
};

export type ChatUserDto ={
    _id: ObjectId;
    username: string;
}