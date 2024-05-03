import { createTheme, Theme } from "@mui/material";

export const primaryTheme: Theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#121B21',
            dark: '#b0272f',
            light: '#ff784e',
        },
        secondary: {
            main: '#19857b',
            dark: '#004c40',
            light: '#4fb3bf',
        },
        background: {
            default: '#222E35',
            paper: '#121B21',
        },
        divider: '#222E35',
    },
});

export const secondaryTheme: Theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#008069',
            dark: '#b0272f',
            light: '#ff784e',
        },
        secondary: {
            main: '#19857b',
            dark: '#004c40',
            light: '#4fb3bf',
        },
        background: {
            default: '#c0c0c0',
            paper: '#e0e0e0',
        },
        divider: '#f0f0f0',
        action: {
            selected: '#c0c0c0',
        },
        text: {
            primary: '#000000',
        }
    },
});
