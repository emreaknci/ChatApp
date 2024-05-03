import { Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import { json, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CustomButton from '../components/CustomButton';
import CustomTextField from '../components/CustomTextField';
import { commonContainerStyles } from '../commonStyles';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';
import StorageService from '../services/storage.service';

const validationSchema = Yup.object({
  fullname: Yup.string().required('Ad ve soyad zorunludur'),
  username: Yup.string().required('Kullanıcı adı zorunludur'),
  email: Yup.string().email('Geçerli bir e-posta adresi girin').required('E-posta zorunludur'),
  password: Yup.string().required('Şifre zorunludur').length(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor').nullable(),
});



const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullname: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitted(true);
      await register();
    }
  });

  const register = async () => {
    const loadingToast = toast.loading('Kayıt olunuyor...');
    await AuthService.register(formik.values).then((res) => {
      toast.success('Kayıt başarılı! Giriş ekranına yönlendiriliyorsunuz...');
      navigate('/');
    }).catch((err) => {
      const response = JSON.parse(err.request.response);
      response.statusCode == 400 && toast.error(response.message);
    }).finally(() => {
      toast.dismiss(loadingToast);
    });
  }

  return (
    <Container component="main" sx={commonContainerStyles}>
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6} >
          <Paper elevation={10} style={{ padding: "1rem", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LockOutlinedIcon sx={{ fontSize: "3rem" }} />
            <Typography component="h1" variant="h5" mt={1}>
              Üye Ol
            </Typography>
            <form onSubmit={formik.handleSubmit} style={{ width: '100%', marginTop: 16 }}>
              <CustomTextField formik={formik} fieldName="fullname" label="*Ad ve Soyad" />
              <CustomTextField formik={formik} fieldName="username" label="*Kullanıcı Adı" />
              <CustomTextField formik={formik} fieldName="email" label="*E-posta" />
              <CustomTextField formik={formik} fieldName="password" label="*Şifre" type="password" />
              <CustomTextField formik={formik} fieldName="confirmPassword" label="*Şifre (Tekrar)" type="password" />
              <Typography variant="caption" onClick={() => navigate('/login')}
                sx={{
                  fontSize: ".9rem",
                  fontWeight: "bold",
                  marginTop: "1rem",
                  justifyContent: "flex-end",
                  ":hover": {
                    cursor: "pointer",
                    color: theme.palette.primary.main,
                    transition: "color .2s ease"
                  }
                }}
              >
                Zaten bir hesabın var mı? Giriş yap!
              </Typography>
              <CustomButton type="submit" text="Kayıt ol" fullWidth variant='contained' />
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>)
}

export default Register