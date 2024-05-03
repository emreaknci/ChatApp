import { Request, Response } from 'express';

import { UserService } from "../services/userService";
import { Result } from '../utils/response/customResult';
import { EditUserDto } from '../dtos/editUserDto';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsers();
        return result.success ? res.status(200).json(result) : res.status(400).json(result);
    } catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}

export const editUserInfo = async (req: Request, res: Response) => {
    try {
        const dto: EditUserDto = req.body as EditUserDto;

        var result = await UserService.editUserInfo(req.params.currentUserId, dto);

        return result.success ? res.status(200).json(result) : res.status(400).json(result);
    } catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getUserById(req.params.id);
        return result.success ? res.status(200).json(result) : res.status(400).json(result);
    } catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}