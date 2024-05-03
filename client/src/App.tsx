import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import { useContext, useEffect } from 'react';
import Chats from './pages/Chats';
import { AuthContext } from './contexts/AuthContext';
import { CircularProgress, Paper, Typography, useTheme } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const Loading = (theme: any) => {
  return (
    <Paper
      sx={{
        width: "100%",
        margin: "auto",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
      >
      <img src="../live-chat.png" />
      <Typography variant="h6" component="h2" sx={{
        textAlign: "center",
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
      }}>
        <CircularProgress sx={{ color: theme.palette.secondary.main, }} />
        <br />
        <Typography variant="body1" component="p" sx={{
          paddingBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.secondary.main,
          fontWeight: 'bold',
          fontSize: '1.5rem',
        }}>
          <LockIcon sx={{ fontSize: '2rem', marginRight: ".5rem" }} />
          Uçtan uca şifrelenen mesajlarınızı güvenle saklayın
        </Typography>
      </Typography>
    </Paper>
  )
}

function App() {
  const { isAuthenticated, isTokenChecked, checkToken } = useContext(AuthContext);
  const theme = useTheme();


  useEffect(() => {
    document.body.style.background = "url('../bg.png')";
    document.body.style.backgroundColor = theme.palette.background.default;
    if (!isTokenChecked) {
      checkToken();
    }
  }, [checkToken,  isTokenChecked, theme]);


  return (
    <div style={{
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {isTokenChecked ?
        <Router>
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Chats />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </Router>
        : <>
          <Loading {...theme} />
        </>
      }

    </div>

  )
}

export default App
