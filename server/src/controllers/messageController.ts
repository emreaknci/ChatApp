import { Request, Response } from 'express';
import { CreateMessageDto } from "../dtos/createMessageDto";
import { MessageService } from "../services/messageService";
import { Result } from "../utils/response/customResult";


export const createMessage = async (req: Request, res: Response) => {
    try {
        const dto: CreateMessageDto = req.body as CreateMessageDto;

        var result = await MessageService.createMessage(req.params.currentUserId, dto);

        return result.success
            ? res.status(200).json(result)
            : res.status(400).json(result);

    }
    catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}

export const getChatMessages = async (req: Request, res: Response) => {
    try {
        var result = await MessageService.getChatMessages(req.params.chatId);

        return result.success
            ? res.status(200).json(result)
            : res.status(400).json(result);

    }
    catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}