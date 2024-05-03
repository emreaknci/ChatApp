import React, { useContext, useEffect, useState } from 'react'
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import { Divider, IconButton, Typography, useTheme, Checkbox, Tab, Tabs, FormControlLabel } from '@mui/material';
import useSlideAnimation from '../hooks/useSlideAnimation';
import { User } from '../models/user';
import UserService from '../services/user.service';
import SearchTextField from '../components/SearchTextField';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CircleIcon from '@mui/icons-material/Circle';
import { ChatType } from '../models/enums/chatType';
import { useFormik } from 'formik';
import CustomButton from '../components/CustomButton';
import CustomTextField from '../components/CustomTextField';
import ChatService from '../services/chat.service';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import { ChatListDto } from '../dtos/chatListDto';
import { encryptMessage } from '../utils/helper/messageEncryptionHelper';

const privateChatValidationSchema = Yup.object({
  users: Yup.array().length(1, 'Bir kişi seçmelisiniz!'),
  firstmessage: Yup.string().required('İlk mesaj zorunludur!'),
});

const groupChatValidationSchema = Yup.object({
  name: Yup.string().required('Grup adı zorunludur!'),
  users: Yup.array().min(2, 'En az iki kişi seçmelisiniz!'),
  firstmessage: Yup.string().required('İlk mesaj zorunludur!'),
});

const broadcastChatValidationSchema = Yup.object({
  users: Yup.array().min(1, 'En az bir kişi seçmelisiniz!'),
  firstmessage: Yup.string().required('İlk mesaj zorunludur!'),
});


enum UserStatusFilters {
  All = "all",
  Online = "online",
  Offline = "offline",
}

const NewChat = ({ openNewChat, setOpenNewChat }: { openNewChat: any, setOpenNewChat: any }) => {
  const authContext = useContext(AuthContext);
  const theme = useTheme();
  const animationStyle = useSlideAnimation(openNewChat);
  const [searchText, setSearchText] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [creating, setCreating] = useState(false);

  const [usersStatusFilter, setUsersStatusFilter] = useState<UserStatusFilters>(UserStatusFilters.All);

  useEffect(() => {
    if (!authContext.currentUser) return;
    if (!authContext.socket?.connected) return;
    const getAllUsers = async () => {
      await UserService.getAllUsers().then((res) => {
        const users = res.data.data.filter((user: User) => user._id !== authContext.currentUser?._id);
        setUsers(users);
        const filteredUsers = users.filter((user: User) => user.username?.toLowerCase());
        setFilteredUsers(filteredUsers);
      }).catch((error) => {
        console.log(error);
      });
    }
    getAllUsers();

  }, [authContext.currentUser, authContext.socket, openNewChat])

  useEffect(() => {
    if (!searchText) {
      return;
    }

    const filterByUsername = (user: User) =>
      user.username?.toLowerCase().includes(searchText.toLowerCase());

    const filterByStatus = (user: User) => {
      switch (usersStatusFilter) {
        case UserStatusFilters.All:
          return true;
        case UserStatusFilters.Online:
          return authContext.activeUserIds.includes(user._id);
        case UserStatusFilters.Offline:
          return !authContext.activeUserIds.includes(user._id);
        default:
          return true;
      }
    };

    const filteredUsers = users.filter(
      (user: User) => filterByUsername(user) && filterByStatus(user)
    );

    setFilteredUsers(filteredUsers);

  }, [authContext.activeUserIds, searchText, users, usersStatusFilter]);

  const formik = useFormik({
    initialValues: {
      name: "",
      users: selectedUsers.map(u => u._id),
      firstmessage: "",
    },
    validationSchema: openNewChat.type === ChatType.Private
      ? privateChatValidationSchema : openNewChat.type === ChatType.Group
        ? groupChatValidationSchema : broadcastChatValidationSchema,
    onSubmit: async (values) => {
      setSubmitted(true);
      if (!values.users.includes(authContext.currentUser!._id!))
        values.users.push(authContext.currentUser!._id!);
      await createChat();
    },
  });

  const handleSelectUser = (user: any) => {
    if (selectedUsers.includes(user)) {

      const updatedUsers = selectedUsers.filter((u) => u !== user);
      const updatedUserIds = updatedUsers.map(u => u._id);

      setSelectedUsers(updatedUsers);
      formik.setFieldValue('users', updatedUserIds);
    }
    else {
      setSelectedUsers([...selectedUsers, user]);
      formik.setFieldValue('users', [...selectedUsers, user]);
    }

    if (openNewChat.type === ChatType.Private) {
      setSelectedUsers([user]);
      formik.setFieldValue('users', [user._id]);
    }
  }

  const createChat = async () => {

    setCreating(true);
    await ChatService.createChat({
      users: formik.values.users,
      type: openNewChat.type as ChatType,
      creator: authContext.currentUser?._id,
      firstmessage: encryptMessage(formik.values.firstmessage),
      name: formik.values.name
    }).then((response) => {

      if(openNewChat.type === ChatType.Private || openNewChat.type === ChatType.Group){
        const chatListDto: ChatListDto = response.data.data;
        authContext.socket?.emit('create-chat', chatListDto);
      }
      else if (openNewChat.type === ChatType.Broadcast) {
        const chatListDtos: ChatListDto[] = response.data.data;
        chatListDtos.forEach((chatListDto: ChatListDto) => {
          authContext.socket?.emit('create-chat', chatListDto);
        });
      }

   
    }).catch((error) => {
      console.log(error)
      toast.error('Sohbet oluşturulurken bir hata oluştu!');
    }).finally(() => {
      setOpenNewChat(false);
      setCreating(false);
    });
  }

  const handleUserStatusFilterChange = (value: any) => {

    switch (value) {
      case UserStatusFilters.All:
        setFilteredUsers(users);
        setUsersStatusFilter(UserStatusFilters.All);
        break;
      case UserStatusFilters.Online:
        setFilteredUsers(users.filter((user: User) => authContext.activeUserIds.includes(user._id)));
        setUsersStatusFilter(UserStatusFilters.Online);
        break;
      case UserStatusFilters.Offline:
        setFilteredUsers(users.filter((user: User) => !authContext.activeUserIds.includes(user._id)));
        setUsersStatusFilter(UserStatusFilters.Offline);
        break;
      default:
        setFilteredUsers(users);
        setUsersStatusFilter(UserStatusFilters.All);
        break;
    }
  }

  const renderUser = (user: User, backgroundColor: string) => (
    <div
      key={user._id}
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

  const renderSelectedUsers = () => {
    return (
      <>
        {openNewChat.type != ChatType.Private && selectedUsers.length > 0 && (
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
            {selectedUsers.length} kişi seçildi
          </Typography>
        )}
        {selectedUsers.map((user: User) => renderUser(user, theme.palette.background.default))}
        <Divider />
        {filteredUsers
          .filter((user: User) => !selectedUsers.includes(user))
          .map((user: User) => renderUser(user, theme.palette.background.paper))}
      </>
    );
  };

  const renderNewPrivateChat = () => {
    return (
      <>
        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: "1rem" }}>
            <CustomTextField formik={formik} fieldName='firstmessage' type='text' label='İlk mesajı yazınız...' />
            <span style={{ color: 'red', fontSize: "0.8rem", }} >{formik.errors.users?.toString()}</span>
            <CustomButton text='OLUŞTUR' type='submit' color='success' variant='contained' />
            <br />
            {renderSelectedUsers()}
          </div>
        </form>
      </>
    )
  }

  const renderNewGroupChat = () => {
    return (
      <>
        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CustomTextField formik={formik} fieldName='name' type='text' label='Grup Adı' />
            <CustomTextField formik={formik} fieldName='firstmessage' type='text' label='İlk mesajı yazınız...' />
            <span style={{ color: 'red', fontSize: "0.8rem", }} >{formik.errors.users?.toString()}</span>
            <CustomButton text='OLUŞTUR' type='submit' color='success' variant='contained' />
            <br />
            {renderSelectedUsers()}
          </div>
        </form>
      </>
    )
  }

  const renderNewBroadCast = () => {
    return (
      <>
        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CustomTextField formik={formik} fieldName='firstmessage' type='text' label='İlk mesajı yazınız...' />
            <span style={{ color: 'red', fontSize: "0.8rem", }} >{formik.errors.users?.toString()}</span>
            <CustomButton text='OLUŞTUR' type='submit' color='success' variant='contained' />
            <br />
            {renderSelectedUsers()}
          </div>
        </form>
      </>
    )

  }

  return (
    <>
      <div style={{
        ...animationStyle,
        height: `${window.innerHeight}px`,
        backgroundColor: theme.palette.background.paper,
      }}>
        <IconButton onClick={() => setOpenNewChat(false)} disableRipple>
          <KeyboardBackspaceIcon sx={{ width: "3rem", height: "3rem", color: theme.palette.text.primary }} />
          <Typography fontWeight={"bold"} sx={{
            ml: 2,
            color: theme.palette.text.primary
          }}>
            {openNewChat.type === ChatType.Private && "Yeni Sohbet"}
            {openNewChat.type === ChatType.Group && "Grup Oluştur"}
            {openNewChat.type === ChatType.Broadcast && "Toplu Mesaj Oluştur"}
          </Typography>
        </IconButton>
        <div style={{ backgroundColor: theme.palette.background.paper, justifyContent: "space-between" }}>
          <div style={{ paddingRight: '1rem', paddingLeft: '1rem' }}>
            <SearchTextField searchText={searchText} setSearchText={setSearchText} />
            <div style={{ paddingRight: '1rem', paddingLeft: '1rem', justifyContent: "center", alignItems: "center", display: "flex" }}>

              <Tabs
                value={usersStatusFilter}
                onChange={(event, newValue) => handleUserStatusFilterChange(newValue)}
                aria-label="usersStatusFilters"
                indicatorColor="secondary"
                textColor="secondary"
                allowScrollButtonsMobile
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab value={UserStatusFilters.All} label="TÜMÜ"
                  style={{
                    fontSize: '.9rem',
                    backgroundColor: usersStatusFilter === 'all' ? theme.palette.action.selected : "transparent",
                  }}
                />
                <Tab value={UserStatusFilters.Online} label="ÇEVRİMİÇİ"
                  style={{
                    fontSize: '.9rem',
                    backgroundColor: usersStatusFilter === 'online' ? theme.palette.action.selected : "transparent",
                  }}
                />
                <Tab value={UserStatusFilters.Offline} label="ÇEVRİMDIŞI"
                  style={{
                    fontSize: '.9rem',
                    backgroundColor: usersStatusFilter === 'offline' ? theme.palette.action.selected : "transparent",
                  }}
                />
              </Tabs>
            </div>

            {openNewChat.type !== ChatType.Private && (
              <Typography sx={{ color: theme.palette.text.secondary }}>
                <FormControlLabel
                  control={
                    <Checkbox color='success' checked={selectedUsers.length > 0}
                      onChange={() => {
                        if (selectedUsers.length > 0) {
                          setSelectedUsers([]);
                          formik.setFieldValue('users', []);
                        } else {
                          setSelectedUsers(filteredUsers);
                          formik.setFieldValue('users', filteredUsers.map(u => u._id));
                        }
                      }}
                    />
                  }
                  label="Tümünü Seç"
                />
              </Typography>
            )}
          </div>

          {creating
            ? <Loading text={"Sohbet Oluşturuluyor..."} />
            :
            <>
              {openNewChat.type === ChatType.Private && renderNewPrivateChat()}
              {openNewChat.type === ChatType.Group && renderNewGroupChat()}
              {openNewChat.type === ChatType.Broadcast && renderNewBroadCast()}
            </>
          }
        </div>
      </div>
    </>
  )
}

export default NewChat