import React, { useContext, useState } from 'react'
import { Container, Paper, Typography, useTheme, Grid } from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';

import { AuthContext } from '../contexts/AuthContext';
import { commonContainerStyles } from './../commonStyles';

const validationSchema = Yup.object({
  userNameOrEmail: Yup.string().required('Kullanıcı adı veya e-posta zorunludur'),
  password: Yup.string().required('Şifre zorunludur'),
});


const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const { login } = useContext(AuthContext)

  const formik = useFormik({
    initialValues: {
      userNameOrEmail: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      setSubmitted(true);
      login(values.userNameOrEmail, values.password);
      navigate('/');
    },
  });

  return (
    <Container component="main" sx={{
      ...commonContainerStyles,
    }} >
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6} >
          <Paper elevation={10} style={{
            padding: "1rem",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <LockOutlinedIcon sx={{ fontSize: "3rem" }} />
            <Typography component="h1" variant="h5" mt={1}>
              Giriş Yap
            </Typography>
            <form onSubmit={formik.handleSubmit} style={{ width: '100%', marginTop: 16 }}>
              <CustomTextField formik={formik} fieldName="userNameOrEmail" label="*Kullanıcı Adı veya Email" type='text' />
              <CustomTextField formik={formik} fieldName="password" label="*Şifre" type="password" />
              <Typography variant="caption" onClick={() => navigate('/register')}
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
                Hesabın yok mu? Hemen kayıt ol!
              </Typography>
              <CustomButton type="submit" text="Giriş Yap" fullWidth variant='contained' />
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Login