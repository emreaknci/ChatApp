import { RegisterDto } from '../dtos/registerDto';
import User, { IUser } from '../models/user';
import bcrypt from 'bcryptjs';
import { IResult, Result } from "../utils/response/customResult";
import { AccessToken } from '../dtos/accessToken';
import jwt from 'jsonwebtoken';
import { LoginDto } from '../dtos/loginDto';

export class AuthService {
    static async registerUser(dto: RegisterDto): Promise<IResult<IUser | null>> {

        var userNameExists = await User.findOne({ username: dto.username });
        if (userNameExists)
            return Result({ success: false, message: "Kullanıcı adı zaten kullanılıyor" });

        var emailExists = await User.findOne({ email: dto.email });
        if (emailExists)
            return Result({ success: false, message: "Email zaten kullanılıyor" });

        if (dto.password !== dto.confirmPassword)
            return Result({ success: false, message: "Şifreler uyuşmuyor" });

        const passwordHash = await bcrypt.hash(dto.confirmPassword, 12);

        const user = new User({
            username: dto.username,
            fullname: dto.fullname,
            email: dto.email,
            password: passwordHash
        });

        user.save();

        return Result({ success: true, message: "Kullanıcı başarıyla oluşturuldu", data: user });
    }

    static async loginUser(dto:LoginDto): Promise<IResult<AccessToken | null>> {
        var user = await User.findOne({ $or: [{ username: dto.userNameOrEmail }, { email: dto.userNameOrEmail }] });
        if (!user)
            return Result({ success: false, message: "Kullanıcı bulunamadı" });

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid)
            return Result({ success: false, message: "Şifre hatalı" });

        const token = jwt.sign({ id: user!._id }, process.env.SECRET_KEY!, { expiresIn: process.env.TOKEN_EXPIRE! });
        const decoded = jwt.decode(token) as any;
        const exp_time = decoded.exp;

        const accessToken: AccessToken = {
            token: token,
            expiresIn: exp_time
        }

        return Result({ success: true, message: "Giriş başarılı", data: accessToken });
    }
}