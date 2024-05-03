import React, { useContext, useState } from 'react'
import { Typography, useTheme, Avatar, Divider, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/AuthContext';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { ThemeContext } from '../contexts/ThemeContext';
import CustomTextField from '../components/CustomTextField';
import { Cancel, Edit } from '@mui/icons-material';
import CustomButton from '../components/CustomButton';
import UserService from '../services/user.service';
import { toast } from 'react-toastify';
import SyncLockIcon from '@mui/icons-material/SyncLock';
import useSlideAnimation from '../hooks/useSlideAnimation';

const validationSchema = Yup.object({
  username: Yup.string().required('Kullanıcı adı zorunludur'),
  fullname: Yup.string().required('Ad soyad zorunludur'),
  email: Yup.string().email('Geçerli bir e-posta adresi girin').required('E-posta zorunludur'),
});

const MyProfile = ({ openMenu, setOpenMenu }: { openMenu: any, setOpenMenu: any }) => {
  const theme = useTheme();
  const themeContext = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);
  const animationStyle = useSlideAnimation(openMenu);

  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const options = [
    { icon: <SyncLockIcon />, text: "Şifremi Değiştir", onClick: () => { navigate("/change-password") } },
    { icon: themeContext.theme === true ? <Brightness7Icon /> : <Brightness4Icon />, text: "Tema Değiştir", onClick: themeContext.toggleTheme },
    { icon: <LogoutIcon />, text: "Çıkış Yap", onClick: logout }
  ]

  const formik = useFormik({
    initialValues: {
      fullname: currentUser?.fullname,
      username: currentUser?.username,
      email: currentUser?.email,
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitted(true);
      await editUserInfo();
    },
  });

  const editUserInfo = async () => {
    const loadingToast = toast.loading("Bilgileriniz güncelleniyor...");
    UserService.editUserInfo(formik.values).then(res => {
      toast.success("Bilgileriniz başarıyla güncellendi");
      setIsEditing(false);
    }).catch(err => {
      const response = err.response.data;
      toast.error(response.message);
    }).finally(() => {
      toast.dismiss(loadingToast);
    });
  }

  return (
    <>
      <div style={{
        ...animationStyle,
        height: `${window.innerHeight}px`,
        backgroundColor: theme.palette.background.paper

      }}>
        <IconButton onClick={() => setOpenMenu(false)} sx={{}} disableRipple>
          <KeyboardBackspaceIcon sx={{ width: "3rem", height: "3rem", color: theme.palette.text.primary }} />
          <Typography fontWeight={"bold"} sx={{
            ml: 2,
            color: theme.palette.text.primary
          }}>
            Profilim
          </Typography>
        </IconButton>
        <div style={{ padding: '1rem', backgroundColor: theme.palette.background.paper, height: "90%", justifyContent: "space-between" }}>
          <Avatar sx={{ bgcolor: "white", color: "black", width: "5rem", height: "5rem", mx: "auto" }} />
          <Typography variant="h6" component="h2" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Bilgileriniz
            {!isEditing ? <IconButton onClick={() => setIsEditing(true)}>
              <Edit />
            </IconButton> :
              <IconButton onClick={() => {
                formik.setValues(formik.initialValues)
                setIsEditing(false)
              }}>
                <Cancel />
              </IconButton>}
          </Typography>
          <Divider />
          <form onSubmit={formik.handleSubmit} style={{ width: '100%', marginTop: 16 }}>
            <div>
              <Typography variant="body1" component="p" sx={{ mt: 2 }}>
                Adınız: <CustomTextField formik={formik} fieldName="fullname" type='text' isEditing={isEditing} isEditable={true} fullWidth={false} />
              </Typography>
              <Typography variant="body1" component="p" sx={{ mt: 2 }}>
                Kullanıcı adı: <CustomTextField formik={formik} fieldName="username" type='text' isEditing={isEditing} isEditable={true} fullWidth={false} />
              </Typography>
              <Typography variant="body1" component="p" sx={{ mt: 2 }}>
                E-posta: <CustomTextField formik={formik} fieldName="email" type='email' isEditing={isEditing} isEditable={true} fullWidth={false} />
              </Typography>
            </div>
            {isEditing && <CustomButton type="submit" text="Kaydet" fullWidth variant='contained' color='success' />}
          </form>

          <Divider />
          {!isEditing && options.map((item, index) => (
            <Typography key={index} variant="body1" component="p" onClick={item.onClick} sx={{ mt: 2, alignItems: "center", display: "flex", cursor: "pointer" }}>
              {item.icon} {item.text}
            </Typography>
          ))}
        </div>


      </div>
    </>
  )
}

export default MyProfile