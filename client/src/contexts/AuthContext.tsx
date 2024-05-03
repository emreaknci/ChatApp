import React, { createContext, useEffect, useState } from 'react'
import AuthService from '../services/auth.service';
import StorageService from '../services/storage.service';
import { useNavigate } from 'react-router-dom';
import { User } from '../models/user';
import { toast } from 'react-toastify';
import { Socket, io } from 'socket.io-client';

export const AuthContext = createContext({
    currentUser: null as User | null,
    isAuthenticated: false,
    isTokenChecked: false,
    checkToken: () => { },
    login: (userNameOrEmail: string, password: string) => { },
    logout: () => { },
    socket: undefined as Socket | undefined,
    activeUserIds: [] as any[],
})


export const AuthProvider = ({ children }: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isTokenChecked, setIsTokenChecked] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | undefined>();
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
    const [activeUserIds, setActiveUserIds] = useState<any[]>([]);

    useEffect(() => {
        const token = StorageService.getAccessToken();
        const expTime = StorageService.getExpTime();
        if (token && expTime && isAuthenticated) {

            const expirationTime = parseInt(expTime!);

            const remainingTime = expirationTime * 1000 - new Date().getTime();
            if (remainingTime <= 0) {
                logout();
                toast.info("Oturumunuzun süresi doldu. Lütfen tekrar giriş yapınız.");
                return;
            }
            setTimeout(() => {
                logout();
                toast.info("Oturumunuzun süresi doldu. Lütfen tekrar giriş yapınız.");
            }, remainingTime);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (!socket) return;
        socket?.on("get-active-users", (userIds: any) => {
            setActiveUserIds(userIds);
        });
    }, [isAuthenticated, socket]);


    const checkToken = async () => {
        const token = StorageService.getAccessToken();
        if (token) {
            await AuthService.checkToken().then(res => {
                const user = res.data.result.data as User;
                setCurrentUser(user);
                setIsAuthenticated(true);
                setIsTokenChecked(true);

                const socket = io(import.meta.env.VITE_SOCKET);
                setSocket(socket);
                connectToSocket(user._id, socket);
            }
            ).catch(err => {
                setIsAuthenticated(false);
                setIsTokenChecked(true);
                disconnectSocket();
            });
        }
        else {
            setIsAuthenticated(false);
            setIsTokenChecked(true);
            disconnectSocket();
        }
    }

    const login = async (userNameOrEmail: string, password: string) => {
        const loadingToast = toast.loading("Giriş yapılıyor...");

        await AuthService.login(userNameOrEmail, password).then(res => {
            StorageService.setAccessToken(res.data.data.token);
            StorageService.setExpTime(res.data.data.expiresIn);
            setIsAuthenticated(true);
            checkToken();
            toast("Giriş Başarılı", { type: "success" });
        }).catch(err => {
            const response = JSON.parse(err.request.response);
            toast(response.message, { type: "error" });
            setIsAuthenticated(false);
        }).finally(() => {
            toast.dismiss(loadingToast);
        });
    }

    const logout = () => {
        setCurrentUser(undefined);
        setIsAuthenticated(false);
        setIsTokenChecked(false);
        StorageService.clearAccessToken();
        socket?.emit('logout', currentUser?._id);
        disconnectSocket();
    }

    const connectToSocket = (userId: any, socket: Socket) => {
        socket?.emit('user-connected', { token: StorageService.getAccessToken(), userId });

        socket?.on('forceLogout', (token) => {
            logout();
            toast.dismiss();
            toast.warning(`Bu hesaba başka bir cihazdan giriş yapıldı. Şüpheli bir durum varsa lütfen bizimle iletişime geçiniz ve şifrenizi değiştiriniz.`);
        });
        socket?.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        setSocket(socket);
    }

    const disconnectSocket = () => {
        if (socket) {
            socket.connected &&
                socket.disconnect();
            setSocket(undefined);
        }
    }

    return (
        <AuthContext.Provider value={{
            currentUser: currentUser as User | null,
            isAuthenticated,
            isTokenChecked,
            checkToken,
            login,
            logout,
            socket,
            activeUserIds

        }}>
            {children}
        </AuthContext.Provider>
    )
}