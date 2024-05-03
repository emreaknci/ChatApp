import BaseService from './_base.service';

const UserService = {
    editUserInfo: async (data: {
        fullname?: string,
        email?: string,
        username?: string,
    }) => BaseService.post(`/user/editUserInfo`, data),

    getAllUsers: async () => BaseService.get(`/user/getAllUsers`),
    getUserById: async (id: string) => BaseService.get(`/user/getUserById/${id}`),
}



export default UserService;