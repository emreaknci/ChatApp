import { Avatar, IconButton, InputAdornment, TextField, Typography, useTheme } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Close, Send } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import ChatService from '../services/chat.service';
import { ChatType } from '../models/enums/chatType';
import MessageService from '../services/message.service';
import { ChatDetailDto } from '../dtos/chatDetailDto';
import { MessageDto } from '../dtos/messageDto';
import { formatTime } from '../utils/helper/timeHelper';
import { ChatUserDto } from '../dtos/chatUserDto';
import Loading from '../components/Loading';
import CircleIcon from '@mui/icons-material/Circle';
import { ChatListDto } from '../dtos/chatListDto';
import CustomButton from '../components/CustomButton';
import AddNewUserToGroup from '../components/AddNewUserToGroup';
import getRandomColor from '../userColors';
import { decryptMessage, encryptMessage } from '../utils/helper/messageEncryptionHelper';

export interface ActivePrivateChatProps {
  selectedChat: { id: string, type: ChatType, },
}

const ActivePrivateChat = (props: ActivePrivateChatProps) => {
  const authContext = useContext(AuthContext);
  const theme = useTheme();
  const messagesRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [chatDetail, setChatDetail] = useState<ChatDetailDto>();

  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showAddNewUser, setShowAddNewUser] = useState(false);


  useEffect(() => {
    setShowChatInfo(false);
  }, [props.selectedChat])

  useEffect(() => {
    if (messages.length > 0) {
      messagesRef.current?.scrollIntoView({
        behavior: "smooth", block: "end", inline: "end"
      });
    }
  }, [messages])

  useEffect(() => {
    const getChatWithMessages = async () => {
      setLoading(true);
      await ChatService.getChatWithMessages(props.selectedChat.id).then((response) => {
        const chatDetail = response.data.data as ChatDetailDto;
        chatDetail.messages.forEach((message: MessageDto) => {
          message.content = decryptMessage(message.content);
        });

        setChatDetail(chatDetail);
        setMessages(chatDetail.messages);

        chatDetail.users.forEach((user: ChatUserDto) => {
          user.color = getRandomColor();
        });

      }).catch((error) => {
        console.log(error);
      }).finally(() => {
        setLoading(false);
      });
    }

    getChatWithMessages();

  }, [authContext.currentUser, props.selectedChat.id])


  useEffect(() => {

    const listenMessageReceived = () => {
      authContext.socket?.on("message-received", async (messageDto: MessageDto) => {
        if (messageDto.chatId !== chatDetail?._id) return;
        const messageListCopy = [...messages];
        const existingMessage = messageListCopy.find(msg => msg._id === messageDto._id);

        if (!existingMessage) {
          messageListCopy.unshift(messageDto);
          setMessages(messageListCopy);
        }
      })
    }

    const listenCreatedChat = () => {
      console.log("dinleniyor")
      authContext.socket?.on("created-chat", async (chatListDtos: ChatListDto[]) => {

        const currentChat = chatListDtos.find(chat => chat._id === chatDetail?._id);
        if (!currentChat) return;
        const messageListCopy = [...messages];
        const existingMessage = messageListCopy.find(msg => msg._id === chatListDtos[0].lastMessage?._id);

        if (!existingMessage && currentChat?.lastMessage) {
          const newMessageList = [...messageListCopy, currentChat.lastMessage];
          setMessages(newMessageList);
        }
      })
    }

    if (authContext.socket?.connected) {
      listenMessageReceived();
      listenCreatedChat();
    }
  }, [authContext.socket, chatDetail?._id, messages])

  const renderChatInfo = (chat: ChatDetailDto) => {
    return (
      <>
        <div style={{
          padding: '1rem',
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          backgroundColor: theme.palette.background.default,
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 'bold', borderRadius: '.5rem',
            p: 1, my: 1,
            backgroundColor: theme.palette.background.paper
          }}>
            Açılma Tarihi: {new Date(chatDetail?.timestamp?.toString() ?? '').toLocaleDateString()}
          </Typography>

          {!showAddNewUser && renderUserList()}
          {showAddNewUser && <AddNewUserToGroup chatDetail={chatDetail!}
            setChatDetail={setChatDetail} open={showAddNewUser} setOpen={setShowAddNewUser} />
          }
        </div>
      </>
    )
  }

  const renderUserList = () => {
    return (
      <Typography variant="h6" sx={{
        fontWeight: 'bold', borderRadius: '.5rem',
        p: 1, my: 1,
        backgroundColor: theme.palette.background.paper
      }}>
        Katılımcılar

        {chatDetail?.users.map((user, index) => (
          <div style={{
            display: 'flex', flexDirection: 'row',
            alignItems: 'center',
            paddingTop: '.5rem',
            paddingBottom: '.5rem',
            borderBottom: index == chatDetail.users.length - 1 ? 'none' : '1px solid #fff'
          }}>
            <Avatar sx={{ color: "white", mx: .1 }}></Avatar>
            <Typography sx={{ display: 'flex', alignItems: 'center', mx: .1 }}  >
              {user.username} {authContext.currentUser?.username == user.username && "(Siz)"} {user._id == chatDetail.creator && "(Kurucu)"}
            </Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center', mx: .1 }} >
              <CircleIcon fontSize='inherit' sx={{ color: authContext.activeUserIds.includes(user._id) ? "green" : "red" }} />
            </Typography>
          </div>
        ))}

        <Typography>
          <CustomButton onClick={() => setShowAddNewUser(true)} text='ÜYE EKLE' type='button' variant='contained' fullWidth color='success' />
        </Typography>
      </Typography>
    )
  }

  const sendMessage = async () => {

    if (text.trim() === '') return;

    const newMessage = {
      chatId: chatDetail?._id ?? '',
      message: encryptMessage(text),
    };
    addMessage(newMessage);

  };

  const addMessage = async (message: any) => {
    setSending(true);
    await MessageService.addMessage(message).then((response) => {
      const messageDto = {
        _id: response.data.data._id,
        chatId: chatDetail?._id ?? '',
        content: encryptMessage(text),
        senderId: authContext.currentUser?._id?.toString() ?? '',
        senderName: authContext.currentUser?.username ?? '',
        time: new Date(),
      };

      const newMessage = {
        ...messageDto,
        content: text,
      };

      // setMessages([...messages, newMessage]);
      setText('');
      setSending(false);

      authContext.socket?.emit('send-message', messageDto);
    }).catch((error) => {
      console.log(error);
    });
  }

  const renderPrivateChatOnlineStatus = () => {
    return (
      <Typography style={{ display: 'flex', alignItems: 'center' }} >
        {authContext.activeUserIds.includes(chatDetail?.users.find(user => user._id !== authContext.currentUser?._id?.toString())?._id) ? 'Çevrimiçi' : 'Çevrimdışı'}
        <CircleIcon fontSize='inherit'
          sx={{
            ml: 1,
            color: authContext.activeUserIds
              .includes(chatDetail?.users.find(user => user._id !== authContext.currentUser?._id?.toString())?._id)
              ? "green"
              : "red",
          }} />
      </Typography>
    )
  }

  return (
    <>
      {loading
        ? <Loading text='Mesajlar Yükleniyor...' />
        : <>
          <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100vh', justifyContent: 'space-between',
          }}>
            <div onClick={() => {
              if (chatDetail?.type != ChatType.Private)
                setShowChatInfo(prev => !prev)
            }}
              style={{
                position: 'sticky', top: 0, zIndex: 1,
                height: "4rem",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}>
              <div style={{ cursor: "pointer" }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '.5rem',
                }}>
                  <Avatar sx={{ color: "black", backgroundColor: "white", mx: '.5rem', width: "3rem", height: "3rem" }}></Avatar>
                  <div>
                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>{chatDetail?.name}</Typography>
                    {chatDetail?.type == ChatType.Private &&
                      <>
                        {renderPrivateChatOnlineStatus()}
                      </>}
                    {chatDetail?.type == ChatType.Group &&
                      <Typography style={{ fontWeight: 'bold' }}>
                        {chatDetail?.users.length} Üye , Detayları Görmek İçin Tıklayın
                      </Typography>
                    }
                  </div>
                </div>
              </div>

            </div>
            {!showChatInfo &&
              <>
                <div style={{
                  padding: '1rem', overflowY: 'auto',
                  height: '100%', display: 'flex',
                  flexDirection: 'column', justifyContent: 'flex-start',
                  backgroundColor: theme.palette.background.default,
                }}>
                  {!loading && chatDetail && messages && messages.slice().reverse().map((message: MessageDto, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: message.senderId === authContext.currentUser?._id?.toString() ? 'flex-end' : 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: 5 }}>
                        {message.senderId !== authContext.currentUser?._id?.toString() && <Avatar sx={{ color: "white", mx: '.5rem' }}></Avatar>}

                        <div key={index} style={{ display: 'flex', justifyContent: message.senderId === authContext.currentUser?._id?.toString() ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.senderId === authContext.currentUser?._id?.toString() ? 'flex-end' : 'flex-start',
                            marginLeft: ".5rem",
                            marginRight: ".5rem",
                          }}>

                            <div style={{
                              flex: 1, color: theme.palette.primary.contrastText,
                              backgroundColor: message.senderId !== authContext.currentUser?._id?.toString()
                                ? theme.palette.primary.main
                                : theme.palette.secondary.main,
                              padding: '.1rem', borderRadius: '1rem',
                              borderBottomLeftRadius: message.senderId === authContext.currentUser?._id?.toString() ? '1rem' : '0',
                              borderBottomRightRadius: message.senderId !== authContext.currentUser?._id?.toString() ? '1rem' : '0',
                            }}>
                              {message.senderId !== authContext.currentUser?._id?.toString() && chatDetail.type !== ChatType.Private &&
                                <p style={{
                                  fontWeight: 'bold',
                                  margin: ".5rem",
                                  color: chatDetail?.users.find(user => user._id === message.senderId)?.color,
                                  alignItems: 'center',
                                  display: 'flex',


                                }} >{message.senderName}
                                  <CircleIcon fontSize='inherit'
                                    sx={{
                                      ml: 1,
                                      color: authContext.activeUserIds
                                        .includes(message.senderId)
                                        ? "green"
                                        : "red",
                                    }} />
                                </p>}
                              <p style={{ margin: ".5rem" }}>{message.content}</p>
                            </div>
                            <p>{formatTime(new Date(message.time))}</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                  <div ref={messagesRef} />
                </div>

                <div style={{
                  position: 'sticky', bottom: 0, zIndex: 1,
                }} >
                  <TextField
                    label="Mesajınızı yazın"
                    variant="filled"
                    fullWidth
                    margin="none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder='Merhaba!'
                    autoComplete='off'
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      position: 'sticky', bottom: 0, zIndex: 1,
                    }}
                    disabled={sending}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {sending ? 'Mesaj gönderiliyor...' : ''}
                          <IconButton
                            disabled={sending}
                            onClick={() => sendMessage()}>
                            <Send />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !sending) {
                        sendMessage();
                      }
                    }}
                  />
                </div>
              </>
            }
            {showChatInfo && chatDetail && chatDetail.type != ChatType.Private && renderChatInfo(chatDetail)}
          </div>
        </>
      }

    </>
  )
}

export default ActivePrivateChat