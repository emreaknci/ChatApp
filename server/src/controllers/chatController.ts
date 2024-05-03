import { Request, Response } from 'express';
import { Result } from "../utils/response/customResult";
import { CreateChatDto } from '../dtos/createChatDto';
import { ChatService } from '../services/chatService';
import { AddNewUserToGroupDto } from '../dtos/addNewUserToGroupDto';


export const createChat = async (req: Request, res: Response) => {
    try {
        const dto: CreateChatDto = req.body as CreateChatDto;

        console.log(req.body)

        var result = await ChatService.createChat(req.params.currentUserId, dto);

        return result.success
            ? res.status(200).json(result)
            : res.status(400).json(result);

    }
    catch (error: any) {
        console.log(error)
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }

}

export const addNewUsersToGroup = async (req: Request, res: Response) => {
    try {
        const dto: AddNewUserToGroupDto = req.body as AddNewUserToGroupDto;

        var result = await ChatService.addNewUsersToGroup(req.params.currentUserId, dto);

        return result.success
            ? res.status(200).json(result)
            : res.status(400).json(result);
    }
    catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}

export const getUserChats = async (req: Request, res: Response) => {
    try {
        var result = await ChatService.getChatsByUserId(req.params.userId);

        return result.success
            ? res.status(200).json(result)
            : res.status(400).json(result);
    }
    catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}

export const getCurrentUserChats = async (req: Request, res: Response) => {
    try {
        var result = await ChatService.getChatsByUserId(req.params.currentUserId);

        return result.success
            ? res.status(200).json(result)
            : res.status(400).json(result);

    }
    catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}

export const getChatWithMessages = async (req: Request, res: Response) => {
    try {
        var result = await ChatService.getChatWithMessagesByUserId(req.params.currentUserId, req.params.chatId);

        return result.success
            ? res.status(200).json(result)
            : res.status(400).json(result);
    }
    catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}