import { RegisterDto } from "../dtos/registerDto";
import { LoginDto } from "../dtos/loginDto";
import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import jwt from 'jsonwebtoken';
import { AuthService } from "../services/authService";
import { IResult, Result } from "../utils/response/customResult";



export const register = async (req: Request, res: Response) => {
    try {
        const dto: RegisterDto = req.body.data as RegisterDto;
        var result = await AuthService.registerUser(dto);
        if (result.success)
            return res.status(200).json(result);
        else
            return res.status(400).json(result);

    } catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const dto: LoginDto = req.body as LoginDto;
        var result = await AuthService.loginUser(dto);

        if (result.success)
            res.status(200).json(result);
        else
            res.status(400).json(result);
    }
    catch (error: any) {
        var err = Result({ success: false, message: error.message });
        return res.status(500).json({ err });
    }
}

export const checkToken = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            var result = Result({ success: false, message: "Token bulunamadı" });
            return res.status(401).json({ result });
        }

        const decoded = jwt.verify(token!, process.env.SECRET_KEY!) as any;

        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            var result = Result({ success: false, message: "Token süresi dolmuş" });
            return res.status(401).json({ result });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            var result = Result({ success: false, message: "Kullanıcı bulunamadı" });
            return res.status(404).json({ result });
        }
        
        var result = Result({ success: true, message: "Token doğrulandı", data: user });
        return res.status(200).json({ result });

    } catch (error: any) {
        result = Result({ success: false, message: error.message });
        return res.status(500).json({ result });
    }
}

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token!, process.env.SECRET_KEY!) as any;

        const user = await User.findOne({ _id: decoded.id });

        var result = Result({ success: true, message: "Kullanıcı bilgileri başarıyla getirildi", data: user });
        return res.status(200).json({ result });

    } catch (error: any) {
        result = Result({ success: false, message: error.message });
        return res.status(500).json({ result });
    }
}
