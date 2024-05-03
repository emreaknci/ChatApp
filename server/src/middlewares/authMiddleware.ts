import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';



const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) 
            return res.status(401).json({ error: 'Yetkisiz erişim!' });
        
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any;
        if (decoded.exp && Date.now() >= decoded.exp * 1000) 
            return res.status(401).json({ error: 'Token süresi geçmiş!' });
        
        const user = await User.findById(decoded.id);
        if (!user) 
            return res.status(400).json({ error: 'Kullanıcı bulunamadı!' });
        
        req.params.currentUserId = decoded.id || decoded.sub;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Kimlik doğrulama başarısız oldu (Geçersiz token)" });
    }
}


export default AuthMiddleware;