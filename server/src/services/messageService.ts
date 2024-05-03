import { MessageDto } from "../dtos/messageDto";
import { CreateMessageDto } from "../dtos/createMessageDto";
import Message, { IMessage } from "../models/message";
import User, { IUser } from "../models/user";
import Chat, { ChatType } from "../models/chat";
import { IResult, Result } from "../utils/response/customResult";
import { ChatService } from "./chatService";
import * as crypto from 'crypto';
import { decryptMessage, encryptMessage } from "../utils/helper/messageEncryptionHelper";


export class MessageService {

    static async getChatMessages(chatId: string): Promise<IResult<MessageDto[]>> {

        const chat = await Chat.findById(chatId);

        if (!chat)
            return Result({ success: false, message: "Chat bulunamadı" });

        const messageIds = chat.messages.map(message => message.toString());

        const messages = await Message.find({ _id: { $in: messageIds } }).sort({ timestamp: 1 });


        if (!messages || messages.length == 0)
            return Result({ success: false, message: "Mesaj bulunamadı" });

        var messagePromises = messages.map(async message => {

            var decryptedMessage = decryptMessage(message.encryptedContent, message.key, message.iv);

            var sender = await User.findById(message.sender);
            return {
                _id: message._id,
                senderId: sender ? sender._id : "",
                content: decryptedMessage,
                senderName: sender ? sender.username : "",
                time: message.timestamp,
            }
        });

        var messagesDtos = await Promise.all(messagePromises);


        return Result({ success: true, data: messagesDtos });
    }

    static async createMessage(userId: string, dto: CreateMessageDto): Promise<IResult<MessageDto | null>> {
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const encryptedMessage = encryptMessage(dto.message, key, iv);
        
        const messageData = {
            sender: userId,
            encryptedContent: encryptedMessage,
            key: key,
            iv: iv,
        };

        const message = new Message(messageData);
        await message.save();

        if (dto.chatId) {
            const chat = await Chat.findById(dto.chatId);
            if (!chat) return Result({ success: false, message: "Chat bulunamadı" });

            chat.messages.push(message._id.toString());
            await chat.save();
        }

        const sender = await User.findById(userId);
        const messageDto: MessageDto = {
            _id: message._id,
            senderId: sender?._id || "",
            content: dto.message,
            senderName: sender?.username || "",
            time: message.timestamp,
        }

        return Result({ success: true, message: "Mesaj başarıyla oluşturuldu", data: messageDto });
    }

    static async getLastMessages(chatIds: string[]): Promise<IResult<MessageDto[]>> {

        const messagesPromises = chatIds.map(chatId => {
            return Message.findOne({ chat: chatId }).sort({ timestamp: -1 }).limit(1);
        });

        var messages = await Promise.all(messagesPromises);

        if (!messages || messages.length == 0)
            return Result({ success: false, message: "Mesaj bulunamadı" });

        var lastMessagesPromises = messages.map(async message => {
            var sender = await User.findById(message!.sender);

            var decryptedMessage = decryptMessage(message!.encryptedContent, message!.key, message!.iv);
            return {
                _id: message ? message._id : null,
                senderId: sender ? sender._id : null,
                content: decryptedMessage ? decryptedMessage : "",
                senderName: sender ? sender.username : "",
                time: message ? message.timestamp : new Date(),
            }
        });


        var lastMessages = await Promise.all(lastMessagesPromises);

        return Result({ success: true, data: lastMessages });
    }
}