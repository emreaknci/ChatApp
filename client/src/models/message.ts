export interface Message {
    _id?: string;
    chatId: string;
    content: string;
    timestamp: Date;
    senderId: string;
}