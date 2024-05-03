import React, { useContext, useEffect, useState } from 'react'
import { AppBar, Avatar, Grid, IconButton, Toolbar, Tooltip, Typography, useTheme } from '@mui/material';
import { ThemeContext } from '../contexts/ThemeContext';
import MyProfile from './MyProfile';
import ChatList from '../components/ChatList';
import LockIcon from '@mui/icons-material/Lock';
import ActivePrivateChat from '../components/ActiveChat';
import { ChatType } from '../models/enums/chatType';
import { AuthContext } from '../contexts/AuthContext';
import NewChat from './NewChat';
import ActiveChat from '../components/ActiveChat';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MessageIcon from '@mui/icons-material/Message';
import ForumIcon from '@mui/icons-material/Forum';


const Chats = () => {
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const [maxHeight, setMaxHeight] = useState("100%");
  const [selectedChat, setSelectedChat] = useState<any>();
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [openNewChat, setOpenNewChat] = useState({ open: false, type: ChatType.Private });

  useEffect(() => {
    function handleResize() {
      setMaxHeight(`${window.innerHeight}px`);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Grid container sx={{
        width: "88.5%", margin: "auto",
        height: `${window.innerHeight}px`,
        backgroundColor: theme.palette.background.default,
      }}>
        <Grid item xs={12} md={5} lg={4} xl={3} sx={{
          maxHeight: maxHeight, overflowY: 'auto',
          overflowX: 'hidden', direction: "initial",
          backgroundColor: theme.palette.background.paper,

        }}>
          {openProfileMenu ? (
            <MyProfile openMenu={openProfileMenu} setOpenMenu={setOpenProfileMenu} />
          ) :
            openNewChat.open
              ?
              <NewChat openNewChat={openNewChat} setOpenNewChat={setOpenNewChat} />
              :
              <>
                <div style={{
                  position: 'sticky', top: 0, zIndex: 1,
                }}>
                  <AppBar
                    position="static"
                  >
                    <Toolbar sx={{
                      backgroundColor: theme.palette.primary.main,
                      display: "flex",
                      width: "100%",
                    }}>
                      <IconButton onClick={() => setOpenProfileMenu(true)} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: "white", color: "black", width: "3rem", height: "3rem" }} />
                      </IconButton>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
                        {authContext.currentUser?.username}
                      </Typography>
                      {[
                        { icon: <GroupAddIcon />, title: "Yeni Grup Oluştur", onclick: () => { setOpenNewChat({ open: true, type: ChatType.Group }) } },
                        { icon: <MessageIcon />, title: "Yeni Sohbet Başlat!", onclick: () => { setOpenNewChat({ open: true, type: ChatType.Private }) } },
                        { icon: <ForumIcon />, title: "Toplu Mesaj At!", onclick: () => { setOpenNewChat({ open: true, type: ChatType.Broadcast }) } },

                      ].map((item, index) => (
                        <Tooltip key={item.title} title={item.title}>
                          <IconButton onClick={item.onclick} sx={{ ml: 1 }} color="inherit">
                            {item.icon}
                          </IconButton>
                        </Tooltip>
                      ))}

                    </Toolbar>
                  </AppBar >
                </div>
                <ChatList selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
              </>
          }
        </Grid>

        <Grid item xs={12} md={7} lg={8} xl={9} sx={{ maxHeight: maxHeight, overflowY: 'auto' }}>
          {selectedChat ?
            <ActiveChat selectedChat={selectedChat} />
            :
            <>
              <div
                style={{
                  display: 'flex', justifyContent: 'center',
                  alignItems: 'center', height: '100%',
                  flexDirection: 'column'
                }}
              >
                <div style={{ margin: 'auto', width: '25%', }}>
                  <img src="../live-chat.png" alt="chat" style={{
                    width: '100%',
                  }} />
                  <Typography variant="h6" component="h2" sx={{
                    padding: '1rem', fontWeight: 'bold',
                    fontSize: '2rem', textAlign: 'center',
                  }}>
                    Sohbet Seç
                  </Typography>
                </div>
                <Typography variant="body1" component="p" sx={{
                  paddingBottom: '2rem', display: 'flex',
                  alignItems: 'center',
                }}>
                  <LockIcon sx={{ fontSize: '1.5rem', marginRight: ".5rem" }} />
                  Kişisel mesajlarınız uçtan uca şifrelenir ve hiçbir şekilde saklanmaz.
                </Typography>
              </div>
            </>
          }

        </Grid>
      </Grid>
    </>
  )
}

export default Chats