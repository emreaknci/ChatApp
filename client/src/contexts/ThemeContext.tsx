import { createContext, useState } from "react";
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { secondaryTheme, primaryTheme } from "../theme";


export const ThemeContext = createContext({
    theme: false,
    toggleTheme: () => { }
});

export const CustomThemeProvider = ({ children }: any) => {
    const [theme, setTheme] = useState(localStorage.getItem('darkMode') === 'true' ? true : false);

    const toggleTheme = () => {
        setTheme(!theme);
        localStorage.setItem('darkMode', (!theme).toString());
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <ThemeProvider theme={theme ? secondaryTheme : primaryTheme}>
                <CssBaseline />

                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}


