export interface MessageDto {
    _id: string;
    chatId?: string;
    senderId: string;
    content: string;
    senderName: string;
    time: Date;
}