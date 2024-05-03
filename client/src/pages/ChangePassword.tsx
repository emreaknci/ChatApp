import React, { useContext, useState } from 'react'
import { Container, Grid, IconButton, Paper, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import CustomButton from '../components/CustomButton';
import CustomTextField from '../components/CustomTextField';
import SyncLockIcon from '@mui/icons-material/SyncLock';
import { commonContainerStyles } from '../commonStyles';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';


const validationSchema = Yup.object({
  oldPassword: Yup.string().required('Eski şifre zorunludur'),
  newPassword: Yup.string().required('Yeni şifre zorunludur').length(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Şifreler eşleşmiyor').nullable(),
});

const ChangePassword = () => {
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);


  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',

    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitted(true);
      await changePassword();

    },
  });

  const changePassword = async () => {
    const loadingToast = toast.loading("Şifreniz değiştiriliyor...");
    await AuthService.changePassword(formik.values.oldPassword, formik.values.newPassword, formik.values.confirmPassword)
      .then((response) => {
        toast.success("Şifreniz başarıyla değiştirildi. Giriş ekranına yönlendiriliyorsunuz...");
        authContext.logout();
        navigate("/");
      })
      .catch((err) => {
        const response = JSON.parse(err.request.response);
        toast.error(response.message);
        console.log(err);
      })
      .finally(() => {
        toast.dismiss(loadingToast);
      });
  }

  return (
    <Container component="main" sx={commonContainerStyles}>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6} >
          <Paper elevation={10} >
            <IconButton onClick={() => navigate("/")} disableRipple>
              <KeyboardBackspaceIcon sx={{ width: "3rem", height: "3rem", color: theme.palette.text.primary }} />
              <Typography fontWeight={"bold"} sx={{
                ml: 2,
                color: theme.palette.text.primary
              }}>
                Geri Dön
              </Typography>
            </IconButton>
            <div style={{ padding: "1rem", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SyncLockIcon sx={{ fontSize: "3rem" }} />
              <Typography component="h1" variant="h5" mt={1}>
                Şifremi Değiştir
              </Typography>
              <form onSubmit={formik.handleSubmit} style={{ width: '100%', marginTop: 16 }}>
                <CustomTextField formik={formik} fieldName="oldPassword" label="*Mevcut Şifre" type="password" />
                <CustomTextField formik={formik} fieldName="newPassword" label="*Yeni Şifre" type="password" />
                <CustomTextField formik={formik} fieldName="confirmPassword" label="*Yeni Şifre (Tekrar)" type="password" />
                <CustomButton type="submit" text="Onayla" fullWidth variant='contained' />
              </form>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ChangePassword