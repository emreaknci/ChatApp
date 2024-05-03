import { EditUserDto } from '../dtos/editUserDto';
import User, { IUser } from '../models/user';
import { IResult, Result } from "../utils/response/customResult";

export class UserService {
    static async getAllUsers(): Promise<IResult<IUser[] | null>> {
        var users = await User.find();
        if (users.length > 0)
            return Result({ success: true, message: "Kullanıcılar başarıyla getirildi", data: users });

        return Result({ success: false, message: "Kullanıcı bulunamadı" });
    }

    static async getUserByUsername(username: string): Promise<IResult<IUser | null>> {
        var user = await User.findOne({ username });
        if (user)
            return Result({ success: true, message: "Kullanıcı başarıyla getirildi", data: user });

        return Result({ success: false, message: "Kullanıcı bulunamadı" });
    }

    static async getUserById(id: string): Promise<IResult<IUser | null>> {
        var user = await User.findById(id);
        if (user)
            return Result({ success: true, message: "Kullanıcı başarıyla getirildi", data: user });

        return Result({ success: false, message: "Kullanıcı bulunamadı" });
    }

    static async getUserByEmail(email: string): Promise<IResult<IUser | null>> {
        var user = await User.findOne({ email });
        if (user)
            return Result({ success: true, message: "Kullanıcı başarıyla getirildi", data: user });

        return Result({ success: false, message: "Kullanıcı bulunamadı" });
    }

    static async editUserInfo(currentUserId: any, dto: EditUserDto): Promise<IResult<IUser | null>> {
        var user = await User.findById(currentUserId);
        if (!user)
            return Result({ success: false, message: "Kullanıcı bulunamadı" });

        var usernameexists = await User.findOne({ username: dto.username });
        if (usernameexists && usernameexists.id != currentUserId)
            return Result({ success: false, message: "Kullanıcı adı zaten kullanımda" });

        var emailexists = await User.findOne({ email: dto.email });
        if (emailexists && emailexists.id != currentUserId)
            return Result({ success: false, message: "E-posta zaten kullanımda" });

        user.fullname = dto.fullname;
        user.username = dto.username;
        user.email = dto.email;

        await user.save();
        return Result({ success: true, message: "Kullanıcı bilgileri güncellendi", data: user });

    }
}