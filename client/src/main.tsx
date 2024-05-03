import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { CustomThemeProvider } from './contexts/ThemeContext.tsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { CssBaseline, useTheme } from '@mui/material'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <CustomThemeProvider>
      <ToastContainer
        position="top-right"
        autoClose={1}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AuthProvider>
        <CssBaseline />
        <App />
      </AuthProvider>
    </CustomThemeProvider>
    <ToastContainer />
  </>,
)
