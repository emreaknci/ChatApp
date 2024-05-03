import BaseService from './_base.service';

const AuthService = {
    login: async (userNameOrEmail: string, password: string) => {
        return await BaseService.post('/auth/login', { userNameOrEmail, password });
    },
    register: async (data: any) => {
        return await BaseService.post('/auth/register', { data });
    },
    changePassword: async (oldpassword: string, newpassword: string, confirmpassword: string) => {
        return await BaseService.post('/auth/changePassword', { oldpassword, newpassword, confirmpassword });
    },
    checkToken: async () => {
        return await BaseService.get('/auth/checkToken');
    },
}

export default AuthService;