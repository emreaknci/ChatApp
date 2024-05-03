import { ObjectId } from "mongoose"
import { ChatType } from "../models/chat"

export type CreateChatDto = {
    type: ChatType,
    users: ObjectId[],
    creator: ObjectId,
    firstmessage: string,
    name?: string
}