import { ObjectId } from "mongoose";

export type MessageDto = {
    _id: ObjectId | string;
    content: string;
    senderId: ObjectId | string;
    senderName: string;
    time: Date;
};