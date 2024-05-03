import { CircularProgress, Typography, useTheme } from '@mui/material'
import React from 'react'

const Loading = ({ text }: { text?: string }) => {
    const theme = useTheme();
    return (
        <Typography variant="h6" component="h2" sx={{
            textAlign: "center",
            color: theme.palette.text.primary,
            display: 'flex',
            flexDirection: "column",
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
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
                {text ? text : "Yükleniyor..."}
            </Typography>
        </Typography>
    )
}

export default Loading