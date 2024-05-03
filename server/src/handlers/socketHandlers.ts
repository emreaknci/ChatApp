import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatService';
import chat from '../models/chat';

type ConnectedUser = {
    token: string;
    socketId: string;
    userId: string;
};


let connectedUsers: ConnectedUser[] = [];

export const handleSocketConnection = (socket: Socket, io: Server) => {
    socket.on('user-connected', ({ token, userId }: { token: string, userId: string }) => {


        const existingUser = connectedUsers.find(user => user.userId === userId);
        if (existingUser && existingUser.token !== token) {
            socket.to(existingUser.socketId).emit('forceLogout', existingUser.token);
            const activeUsers = connectedUsers.filter(u => u.userId !== existingUser.userId);
            connectedUsers = activeUsers;
        }

        const newUser: ConnectedUser = {
            token: token,
            socketId: socket.id,
            userId
        };
        connectedUsers.push(newUser);
        console.log("New user connected => ", newUser.userId);
        const activeUserIds = connectedUsers.map(user => user.userId);
        io.emit('get-active-users', activeUserIds);
    });

    socket.on("user-discconnected", (userId: string) => {
        const disconnectedUser = connectedUsers.find(user => user.userId === userId);
        if (disconnectedUser) {
            const activeUserIds = connectedUsers.filter(u => u.userId !== disconnectedUser.userId).map(user => user.userId);

            const activeUsers = connectedUsers.filter(u => u.userId !== disconnectedUser.userId);
            connectedUsers = activeUsers;

            console.log("User disconnected => ", disconnectedUser.userId)

            io.emit('get-active-users', activeUserIds);
        }
    });

    socket.on("logout", (userId: string) => {
        const disconnectedUser = connectedUsers.find(user => user.userId === userId);
        if (disconnectedUser) {
            const activeUserIds = connectedUsers.filter(u => u.userId !== disconnectedUser.userId).map(user => user.userId);

            const activeUsers = connectedUsers.filter(u => u.userId !== disconnectedUser.userId);

            connectedUsers = activeUsers;

            io.emit('get-active-users', activeUserIds);
        }
    });

    socket.on("send-message", async (messageDto: any) => {

        var response = await ChatService.getChatUserIds(messageDto.chatId)

        if (!response.success) return;
        let chatUserIds = response.data as string[];

        chatUserIds.forEach(userId => {
            const connectedUser = connectedUsers.find(user => user.userId === userId);
            if (connectedUser) {
                io.to(connectedUser.socketId).emit("message-received", messageDto);
            }
        });
    });

    socket.on("create-chat", async (chatListDto: any) => {
        console.log("chatListDto => ", chatListDto);
        var response = await ChatService.getChatUserIds(chatListDto._id)
        if (!response.success) return;
        let chatUserIds = response.data as string[];
        
        chatUserIds.forEach(async userId => {
            const userChats = await ChatService.getChatsByUserId(userId);
            if (!userChats.success) return;
            let chatListDtos = userChats.data as any;

            const connectedUser = connectedUsers.find(user => user.userId === userId);
            if (connectedUser) {
                io.to(connectedUser.socketId).emit("created-chat", chatListDtos);
            }
        });


    });

    socket.on('disconnect', () => {
        const disconnectedUser = connectedUsers.find(user => user.socketId === socket.id);
        if (disconnectedUser) {
            const activeUserIds = connectedUsers.filter(u => u.userId !== disconnectedUser.userId).map(user => user.userId);

            const activeUsers = connectedUsers.filter(u => u.userId !== disconnectedUser.userId);

            connectedUsers = activeUsers;

            io.emit('get-active-users', activeUserIds);
        }
    });

};

