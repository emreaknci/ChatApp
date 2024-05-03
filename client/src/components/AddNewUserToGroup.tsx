import React, { useContext, useEffect, useState } from 'react'
import { ChatUserDto } from '../dtos/chatUserDto'
import { User } from '../models/user';
import UserService from '../services/user.service';
import { AuthContext } from '../contexts/AuthContext';
import { Divider, Typography, useTheme } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import CustomButton from './CustomButton';
import SearchTextField from './SearchTextField';
import { toast } from 'react-toastify';
import getRandomColor from '../userColors';
import { ChatDetailDto } from '../dtos/chatDetailDto';
import ChatService from '../services/chat.service';
import Loading from './Loading';


export interface AddNewUserToGroupProps {
    chatDetail: ChatDetailDto,
    setChatDetail: any,
    open: boolean,
    setOpen: any
}


const AddNewUserToGroup = (props: AddNewUserToGroupProps) => {
    const authContext = useContext(AuthContext);
    const theme = useTheme();

    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    useEffect(() => {
        const getAllUsers = async () => {
            setLoading(true);
            setLoadingText("Kullanıcılar yükleniyor...");
            await UserService.getAllUsers().then((res) => {
                const users = res.data.data as User[];
                const filteredUsers = users.filter((user: User) => !props.chatDetail.users.some((chatUser: ChatUserDto) => chatUser._id.toString() === user._id?.toString()));

                setUsers(filteredUsers);
                setFilteredUsers(filteredUsers);

            }).catch((error) => console.log(error))
                .finally(() => setLoading(false));
        }
        getAllUsers();

    }, [props.chatDetail.users])

    useEffect(() => {
        if (searchText === "") {
            setFilteredUsers(users);
            return;
        }
        if (!users) return;
        const filteredUsers = users.filter((user: User) => user.username!.toLowerCase().includes(searchText.toLowerCase()));
        setFilteredUsers(filteredUsers);
    }, [searchText, users])

    const handleSelectUser = (user: any) => {
        if (selectedUsers.includes(user)) {
            const updatedUsers = selectedUsers.filter((u) => u !== user);
            setSelectedUsers(updatedUsers);
        }
        else {
            setSelectedUsers([...selectedUsers, user]);
        }
    }
    const renderUser = (user: User, backgroundColor: string) => (
        <div
            key={user._id + "-user"}
            onClick={() => handleSelectUser(user)}
            style={{
                display: 'flex', alignItems: 'center', cursor: 'pointer',
                padding: '1rem', marginBottom: 8, borderRadius: 8, backgroundColor,
            }}
        >
            <Typography>{user.username}</Typography>
            <Typography
                sx={{
                    ml: 'auto',
                    fontSize: ".9rem",
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.text.secondary
                }}
            >
                {authContext.activeUserIds.includes(user._id) ? "Çevrimiçi" : "Çevrimdışı"}
                <CircleIcon
                    fontSize='inherit'
                    sx={{
                        color: authContext.activeUserIds.includes(user._id) ? "green" : "red",
                        ml: 1
                    }}
                />
            </Typography>
        </div>
    );

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) {
            toast.error("En az bir kişi seçmelisiniz.");
            return;
        }
        const userIds = selectedUsers.map((user: User) => user._id);

        const newChatUserDtos: ChatUserDto[] = selectedUsers.map((user: User) => {
            return {
                _id: user._id!.toString(),
                username: user.username!,
                chatId: props.chatDetail._id!.toString(),
                color: getRandomColor()
            }
        });
        setLoading(true);
        setLoadingText("Ekleniyor...");
        await ChatService.addNewUsersToGroup({ chatId: props.chatDetail._id!.toString(), userIds }).then((res) => {
            props.setChatDetail({
                ...props.chatDetail,
                users: [...props.chatDetail.users, ...newChatUserDtos]
            });
            props.setOpen(false);
            toast.success("Yeni kullanıcılar eklendi.");
        }).catch((error) => {
            console.log(error);
            toast.error("Hata oluştu.");
        }).finally(() => setLoading(false));
    }

    return (
        <>
            <div style={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: '.5rem', padding: '1rem', marginTop: '1rem', marginBottom: '1rem'
            }}>
                Yeni Üye Ekle
                {loading ? <div> {loadingText} </div> :
                    <>
                        <SearchTextField searchText={searchText} setSearchText={setSearchText} />

                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                            {selectedUsers.length} kişi seçildi
                        </Typography>
                        {selectedUsers.map((user: User) => renderUser(user, theme.palette.background.default))}
                        <Divider />
                        {filteredUsers
                            .filter((user: User) => !selectedUsers.includes(user))
                            .map((user: User) => renderUser(user, theme.palette.background.paper))}

                        <CustomButton onClick={handleSubmit} text='EKLE' type='submit' variant='contained' fullWidth color='success' />
                        <CustomButton onClick={() => props.setOpen(false)} text='İPTAL' type='button' variant='contained' fullWidth color='error' />
                    </>}
            </div>
        </>
    )
}

export default AddNewUserToGroup