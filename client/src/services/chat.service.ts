import { ChatType } from '../models/enums/chatType';
import BaseService from './_base.service';

const ChatService = {
    createChat: async (data: {
        users: any[],
        type: ChatType,
        creator: any,
        firstmessage: string,
        name?: string
    }) => BaseService.post(`/chat`, data),

    getCurrentUserChats: async () => BaseService.get(`/chat`),
    getUserChats: async (userId: string) => BaseService.get(`/chat/${userId}`),
    getChatWithMessages: async (chatId: string) => BaseService.get(`/chat/get-chat-with-messages/${chatId}`),
    addNewUsersToGroup: async (data: { chatId: string, userIds: any[] }) => BaseService.post(`/chat/add-new-usesr-to-group`, data)
}

export default ChatService;