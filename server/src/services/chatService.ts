import { IResult, Result } from "../utils/response/customResult";
import Chat, { ChatType, IChat } from '../models/chat';
import { CreateChatDto } from "../dtos/createChatDto";
import { MessageService } from "./messageService";
import { CreateMessageDto } from "../dtos/createMessageDto";
import User, { IUser } from "../models/user";
import { ChatListDto } from "../dtos/chatListDto";
import { MessageDto } from "../dtos/messageDto";
import { ChatDetailDto, ChatUserDto } from "../dtos/chatDetailDto";
import mongoose from "mongoose";
import { AddNewUserToGroupDto } from "../dtos/addNewUserToGroupDto";


export class ChatService {

    static async createChat(userId: string, dto: CreateChatDto): Promise<IResult<ChatListDto | ChatListDto[] | null>> {

        if (dto.type === ChatType.Private) {
            return await this.createPrivateChat(userId, dto);
        }
        else if (dto.type === ChatType.Group) {
            return await this.createGroupChat(userId, dto);
        }
        else if (dto.type === ChatType.Broadcast) {
            return await this.createBroadcastChat(userId, dto);
        }

        return Result({ success: false, message: "Geçersiz sohbet türü" });
    }

    static async createPrivateChat(userId: string, dto: CreateChatDto): Promise<IResult<ChatListDto | null>> {
        const chatExists = await Chat.findOne({ users: { $all: dto.users, $size: 2 } });

        if (chatExists) {
            const createMessageResult = await MessageService.createMessage(userId, { message: dto.firstmessage, chatId: chatExists._id.toString() });

            if (!createMessageResult.success) return Result({ success: false, message: createMessageResult.message });

            chatExists.messages.push(new mongoose.Types.ObjectId(createMessageResult.data!._id.toString()));
            await chatExists.save();
            const chatListDto: ChatListDto = {
                _id: chatExists._id,
                name: createMessageResult.data!.senderName ?? "",
                type: chatExists.type,
                lastMessage: {
                    _id: createMessageResult.data!._id,
                    senderId: createMessageResult.data!.senderId,
                    content: createMessageResult.data!.content,
                    senderName: createMessageResult.data!.senderName,
                    time: createMessageResult.data!.time
                }
            }

            return Result({ success: true, message: "", data: chatListDto })
        }

        const chat = new Chat({
            users: dto.users,
            creator: userId,
            type: dto.type,
            name: dto.name
        });

        const messageResult = await MessageService.createMessage(userId, { message: dto.firstmessage });
        if (!messageResult.success) return Result({ success: false, message: messageResult.message });

        chat.messages.push(new mongoose.Types.ObjectId(messageResult.data!._id.toString()));

        await chat.save();

        const chatListDto: ChatListDto = {
            _id: chat._id,
            name: messageResult.data!.senderName ?? "",
            type: chat.type,
            lastMessage: {
                _id: messageResult.data!._id,
                senderId: messageResult.data!.senderId,
                content: messageResult.data!.content,
                senderName: messageResult.data!.senderName,
                time: messageResult.data!.time
            }
        }

        return Result({ success: true, message: "Sohbet başarıyla oluşturuldu", data: chatListDto })
    }

    static async createGroupChat(userId: string, dto: CreateChatDto): Promise<IResult<ChatListDto | null>> {
        const chat = new Chat({
            users: dto.users,
            creator: userId,
            type: dto.type,
            name: dto.name
        });

        const createMessageDto: CreateMessageDto = {
            message: dto.firstmessage
        }
        const result = await MessageService.createMessage(userId, createMessageDto);

        if (!result.success) return Result({ success: false, message: result.message });

        chat.messages.push(new mongoose.Types.ObjectId(result.data!._id.toString()));
        await chat.save();

        const chatListDto: ChatListDto = {
            _id: chat._id,
            name: chat.name ?? dto.name ?? "",
            type: chat.type,
            lastMessage: {
                _id: result.data!._id,
                senderId: result.data!.senderId,
                content: result.data!.content,
                senderName: result.data!.senderName,
                time: new Date()
            }
        }

        return Result({ success: true, message: "Sohbet başarıyla oluşturuldu", data: chatListDto });
    }

    static async createBroadcastChat(userId: string, dto: CreateChatDto): Promise<IResult<ChatListDto[] | null>> {

        const createMessageDto: CreateMessageDto = {
            message: dto.firstmessage
        }
        const result = await MessageService.createMessage(userId, createMessageDto);

        if (!result.success) return Result({ success: false, message: result.message });

        let chatListDtos: ChatListDto[] = [];

        for (let i = 0; i < dto.users.length; i++) {
            const checkIfPrivateChatExistsBetweenUsers = await Chat.findOne({ users: { $all: [userId, dto.users[i]] }, type: ChatType.Private });

            if (checkIfPrivateChatExistsBetweenUsers) {
                checkIfPrivateChatExistsBetweenUsers.messages.push(new mongoose.Types.ObjectId(result.data!._id.toString()));
                await checkIfPrivateChatExistsBetweenUsers.save();

                const chatListDtoItem: ChatListDto = {
                    _id: checkIfPrivateChatExistsBetweenUsers._id,
                    name: "",
                    type: checkIfPrivateChatExistsBetweenUsers.type,
                    lastMessage: {
                        _id: result.data!._id,
                        senderId: result.data!.senderId,
                        content: result.data!.content,
                        senderName: result.data!.senderName,
                        time: new Date()
                    }
                }
                chatListDtos.push(chatListDtoItem);
                continue;
            }

            const chat = new Chat({
                users: [userId, dto.users[i]],
                creator: userId,
                type: ChatType.Private,
                messages: [new mongoose.Types.ObjectId(result.data!._id.toString())]
            });

            const chatListDtoItem: ChatListDto = {
                _id: chat._id,
                name: "",
                type: chat.type,
                lastMessage: {
                    _id: result.data!._id,
                    senderId: result.data!.senderId,
                    content: result.data!.content,
                    senderName: result.data!.senderName,
                    time: new Date()
                }
            }

            chatListDtos.push(chatListDtoItem);
            await chat.save();
        }

        return Result({ success: true, message: "Sohbet başarıyla oluşturuldu", data: chatListDtos });
    }

    static async addNewUsersToGroup(userId: string, dto: AddNewUserToGroupDto): Promise<IResult<ChatDetailDto | null>> {
        const { chatId, userIds } = dto;
        const chat = await Chat.findById(chatId);

        if (!chat)
            return Result({ success: false, message: "Sohbet bulunamadı" });

        const users = await User.find({ _id: { $in: userIds } });

        if (!users || users.length === 0)
            return Result({ success: false, message: "Kullanıcılar bulunamadı" });

        chat.users.push(...userIds);

        await chat.save();

        const chatDetailDto = await this.getChatWithMessagesByUserId(userId, chatId);

        return chatDetailDto;
    }

    static async getChatsByUserId(userId: string): Promise<IResult<ChatListDto[]>> {

        var chats = await Chat.find({ users: userId });

        if (!chats || chats.length == 0)
            return Result({ success: false, message: "Sohbet bulunamadı" });


        var chatListDto: ChatListDto[] = [];

        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];

            var chatMessages = await MessageService.getChatMessages(chat._id.toString());

            var lastMessage = chatMessages.data?.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())[0];

            var chatListDtoItem: ChatListDto = {
                _id: chat._id,
                name: "",
                type: chat.type,
                lastMessage: undefined,
            };

            if (lastMessage) {
                chatListDtoItem.lastMessage = {
                    _id: lastMessage._id,
                    senderId: lastMessage.senderId,
                    content: lastMessage.content,
                    senderName: lastMessage.senderName,
                    time: lastMessage.time
                }
            }

            if (chat.type === ChatType.Private) {
                var users = await User.find({ _id: { $in: chat.users } });
                var user = users.filter(user => user._id.toString() !== userId)[0];
                chatListDtoItem.name = user.username;
            }

            else if (chat.type === ChatType.Group) {
                chatListDtoItem.name = chat.name ?? "";
            }


            chatListDto.push(chatListDtoItem);
        }

        chatListDto.sort((a, b) => {
            if (!a.lastMessage || !b.lastMessage) return 0;
            return new Date(b.lastMessage.time).getTime() - new Date(a.lastMessage.time).getTime();
        });

        return Result({ success: true, data: chatListDto });
    }

    static async getChatWithMessagesByUserId(userId: string, chatId: string): Promise<IResult<ChatDetailDto | null>> {
        const chat = await Chat.findById(chatId);

        if (!chat)
            return Result({ success: false, message: "Sohbet bulunamadı" });

        const messagesResult = await MessageService.getChatMessages(chatId);

        if (!messagesResult.success)
            return Result({ success: false, message: messagesResult.message });

        const messages = messagesResult.data;

        var messageDtos: MessageDto[] = [];

        messages?.forEach(message => {
            var messageItem: MessageDto = {
                _id: message._id,
                senderId: message.senderId,
                content: message.content,
                senderName: message.senderName,
                time: message.time
            };

            messageDtos.push(messageItem);
        });



        var users = await User.find({ _id: { $in: chat.users } });
        var userDtos: ChatUserDto[] = users.map((user: IUser) => {
            return {
                _id: user._id,
                username: user.username
            }
        });


        messageDtos.sort((a, b) => {
            if (!a.time || !b.time) return 0;
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

        var chatDetailDto: ChatDetailDto = {
            _id: chat._id,
            name: "",
            type: chat.type,
            users: userDtos,
            messages: messageDtos,
            creator: userDtos.filter(user => user._id.toString() === chat.creator.toString())[0]._id,
            timestamp: chat.timestamp
        };

        if (chat.type === ChatType.Private) {
            var users = await User.find({ _id: { $in: chat.users } });
            var user = users.filter(user => user._id.toString() !== userId)[0];
            chatDetailDto.name = user.username;
        }
        else if (chat.type === ChatType.Group) {
            chatDetailDto.name = chat.name ?? "";
        }

        return Result({ success: true, data: chatDetailDto });
    }

    static async getChatUserIds(chatId: string): Promise<IResult<string[]>> {
        const chat = await Chat.findById(chatId);

        if (!chat)
            return Result({ success: false, message: "Sohbet bulunamadı" });

        const userIds = chat.users.map(user => user.toString());

        return Result({ success: true, data: userIds });
    }
}
