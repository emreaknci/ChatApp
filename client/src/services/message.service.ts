import BaseService from './_base.service';

const MessageService = {
    addMessage: async (data: { chatId: any, message: string }) => BaseService.post(`/message`, data),

    getChatMessages: async (chatId: string) => BaseService.get(`/message/${chatId}`),
}

export default MessageService;