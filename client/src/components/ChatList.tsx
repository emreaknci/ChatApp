import { Avatar, useTheme, Box, Divider, Typography, Button, Tab, Tabs } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import SearchTextField from './SearchTextField';
import { AuthContext } from '../contexts/AuthContext';
import { ChatType } from '../models/enums/chatType';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ChatService from '../services/chat.service';
import { ChatListDto } from './../dtos/chatListDto';
import { formatTime } from '../utils/helper/timeHelper';
import Loading from './Loading';
import { MessageDto } from './../dtos/messageDto';
import { toast } from 'react-toastify';
import { decryptMessage } from '../utils/helper/messageEncryptionHelper';
export interface ChatListProps {
    selectedChat: any,
    setSelectedChat: any,
}

const ChatList = (props: ChatListProps) => {
    const theme = useTheme();
    const authContext = useContext(AuthContext);

    const [chatList, setChatList] = useState<ChatListDto[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [filteredChatList, setFilteredChatList] = useState<ChatListDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [activeButtonType, setActiveButtonType] = useState<ChatType | null>(null);

    useEffect(() => {
        setLoading(true);
        const getCurrentUserChats = async () => {
            await ChatService.getCurrentUserChats().then((response) => {
                const chatListDtos = response.data.data as ChatListDto[];

                chatListDtos.forEach(chat => {
                    chat.lastMessage!.content = decryptMessage(chat.lastMessage!.content);
                });

                setChatList(chatListDtos);
            }).catch((error) => console.log(error))
                .finally(() => setLoading(false));
        }

        getCurrentUserChats();
    }, []);

    useEffect(() => {
        const renderToast = (message: string, chat: ChatListDto) => {
            const closeToast = () => toast.dismiss();
            closeToast();
            toast.info(message, {
                onClick: () => {
                    closeToast();
                    props.setSelectedChat({ id: chat._id, type: chat.type });
                }
            });
        }

        const listenMessageReceived = () => {
            authContext.socket?.on("message-received", async (messageDto: MessageDto) => {
                messageDto.content = decryptMessage(messageDto.content);
                const chatListCopy = [...chatList];
                const chatIndex = chatListCopy.findIndex(chat => chat._id === messageDto.chatId);

                if (chatIndex === -1) return;
                if (chatListCopy[chatIndex].lastMessage?._id === messageDto._id) return;

                chatListCopy[chatIndex].lastMessage = messageDto as MessageDto;

                const movedChat = chatListCopy.splice(chatIndex, 1)[0];
                chatListCopy.unshift(movedChat);
                setChatList(chatListCopy);
                setFilteredChatList(chatListCopy);

                const isPrivateChat = movedChat.type === ChatType.Private;
                const isGroupChat = movedChat.type === ChatType.Group;
                const isCurrentUserSenderInPrivate = authContext.currentUser?._id?.toString() !== movedChat.lastMessage?.senderId;
                const isCurrentUserSenderInGroup = movedChat.lastMessage?.senderId !== authContext.currentUser?._id?.toString();
                const isDifferentChatSelected = props.selectedChat?.id !== movedChat._id;

                if (isPrivateChat && isDifferentChatSelected && isCurrentUserSenderInPrivate) {
                    const senderName = movedChat.lastMessage?.senderName;
                    renderToast(`${senderName} adlı kullanıcıdan yeni bir mesajınız var!`, movedChat);
                }
                else if (isGroupChat && isDifferentChatSelected && isCurrentUserSenderInGroup) {
                    const groupName = movedChat.name;
                    renderToast(`${groupName} adlı gruptan yeni mesajınız var!`, movedChat);
                }
            })
        }

        const listenCreatedChat = () => {
            authContext.socket?.on("created-chat", async (chatListDtos: ChatListDto[]) => {
                chatListDtos.forEach(chat => {
                    chat.lastMessage!.content = decryptMessage(chat.lastMessage!.content);
                });

                setChatList(chatListDtos);
                setFilteredChatList(chatListDtos);

                const isFirstPrivateChat = chatListDtos[0].type === ChatType.Private;
                const isFirstGroupChat = chatListDtos[0].type === ChatType.Group;
                const isCurrentUserSender = authContext.currentUser?._id?.toString() === chatListDtos[0].lastMessage?.senderId;
                const isDifferentChatSelected = props.selectedChat?.id !== chatListDtos[0]._id;

                if (isFirstPrivateChat && isDifferentChatSelected && !isCurrentUserSender) {
                    const senderName = chatListDtos[0].lastMessage?.senderName;
                    renderToast(`${senderName} adlı kullanıcıdan yeni bir mesajınız var!`, chatListDtos[0]);
                }
                else if (isFirstGroupChat && !isCurrentUserSender) {
                    const groupName = chatListDtos[0].name;
                    renderToast(`${groupName} adlı gruba eklendiniz!`, chatListDtos[0]);
                }
            })
        }
        if (authContext.socket && authContext.socket?.connected) {
            listenMessageReceived();
            listenCreatedChat();
        }

        return () => {
            authContext.socket?.off("message-received");
            authContext.socket?.off("created-chat");
        }
    }, [authContext.currentUser?._id, authContext.socket, authContext.socket?.connected, chatList, props, props.selectedChat?.id])

    useEffect(() => {
        setFilteredChatList(chatList.filter(chat => chat.name!.toLowerCase().includes(searchText.toLowerCase())));
    }, [searchText, chatList]);

    const handleClickChat = (chat: ChatListDto) => {
        if (chat.type === ChatType.Group)
            props.setSelectedChat({ id: chat._id, type: ChatType.Group });

        else if (chat.type === ChatType.Private)
            props.setSelectedChat({ id: chat._id, type: ChatType.Private });
    }
    const getAvatar = (type: ChatType) => (
        <Avatar sx={{
            color: theme.palette.getContrastText(theme.palette.common.white),
            backgroundColor: theme.palette.common.white,
            marginRight: '1rem', width: "3rem", height: "3rem"
        }}>
            {type === ChatType.Private && <PersonIcon />}
            {type === ChatType.Group && <GroupIcon />}
        </Avatar>
    );

    const filterChatsByType = (type: ChatType) => {
        const filteredChats = chatList.filter(chat => chat.type === type);
        setFilteredChatList(filteredChats);
        setActiveButtonType(type);
    };

    const makeMessageShort = (message: string) => {
        return message.length > 30 ? `${message.substring(0, 30)}...` : message;
    }

    return (
        <>

            <div style={{ position: 'sticky', top: '4rem', zIndex: 1, backgroundColor: theme.palette.background.paper }}>
                {!loading && <>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                        Sohbetler
                    </Typography>
                    <div style={{ paddingRight: '1rem', paddingLeft: '1rem', }}>
                        <SearchTextField searchText={searchText} setSearchText={setSearchText} />
                    </div>
                    <div style={{ paddingRight: '1rem', paddingLeft: '1rem', justifyContent: "center", alignItems: "center", display: "flex" }}>
                        <Tabs
                            value={activeButtonType}
                            onChange={(event, newValue) => {
                                if (newValue === null) {
                                    setFilteredChatList(chatList);
                                    setActiveButtonType(null);
                                } else {
                                    filterChatsByType(newValue);
                                }
                            }}
                            indicatorColor="secondary"
                            textColor="secondary"
                            allowScrollButtonsMobile
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                label="HEPSİ"
                                value={null}
                                style={{
                                    backgroundColor: activeButtonType === null
                                        ? theme.palette.action.selected
                                        : "transparent",
                                }}
                            />
                            <Tab
                                label="BİREYSEL SOHBETLER"
                                value={ChatType.Private}
                                style={{
                                    backgroundColor: activeButtonType === ChatType.Private
                                        ? theme.palette.action.selected
                                        : "transparent",
                                }}
                            />
                            <Tab
                                label="GRUPLAR"
                                value={ChatType.Group}
                                style={{
                                    backgroundColor: activeButtonType === ChatType.Group
                                        ? theme.palette.action.selected
                                        : "transparent",
                                }}
                            />
                        </Tabs>
                    </div>
                </>
                }
            </div>
            {loading ? <Loading text='Sohbetler Yükleniyor...' />
                : <div>
                    <Typography component="div" sx={{ flexGrow: 1, ml: 2, my: 1 }}>
                        {filteredChatList.length} Sohbet Bulundu
                    </Typography>
                    {filteredChatList?.map((chat: ChatListDto, index: number) => (
                        <div key={chat._id}>
                            {index === chatList.length - 1 ? null : <Divider />}
                            <Box
                                onClick={() => handleClickChat(chat)}
                                sx={{
                                    display: 'flex', alignItems: 'center',
                                    paddingLeft: '1rem', paddingRight: '1rem',
                                    borderRadius: 0, cursor: 'pointer',
                                    borderBottom: index === chatList.length - 1 ? 'none' : `.1rem solid ${theme.palette.divider}`,
                                    backgroundColor: props.selectedChat?.id !== chat._id ? null : theme.palette.action.selected,
                                    "&:hover": {
                                        backgroundColor: props.selectedChat?.id == chat._id ? theme.palette.action.selected : theme.palette.action.hover
                                    }
                                }}
                            >
                                {getAvatar(chat.type!)}
                                <div style={{ flex: 1 }}>
                                    <h2>{chat.name}</h2>

                                    {chat && chat.lastMessage &&
                                        <p style={{ fontSize: ".9rem" }}>
                                            <span style={{ fontWeight: "bold" }}>
                                                {chat.type === ChatType.Group && chat.lastMessage && (
                                                    chat.lastMessage.senderId !== authContext.currentUser?._id?.toString()
                                                        ? chat.lastMessage.senderName + ": "
                                                        : "Siz: "
                                                )}
                                                {chat.type === ChatType.Private && chat.lastMessage && (
                                                    chat.lastMessage.senderId === authContext.currentUser?._id?.toString() && "Siz: "
                                                )}

                                            </span>
                                            {makeMessageShort(chat.lastMessage.content)}
                                        </p>}
                                </div>
                                {chat.lastMessage && <p>{formatTime(new Date(chat.lastMessage!.time))}</p>}
                            </Box>
                        </div>
                    ))}
                    {filteredChatList.length === 0 &&
                        <div style={{
                            display: 'flex', justifyContent: 'center',
                            alignItems: 'center', height: '100%',
                            color: theme.palette.text.secondary
                        }}>
                            <h3>Sohbet bulunamadı</h3>
                        </div>
                    }
                </div>}
        </>
    )
}

export default ChatList