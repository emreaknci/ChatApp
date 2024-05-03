import { TextField, InputAdornment, useTheme } from '@mui/material'
import React from 'react'
import ClearIcon from '@mui/icons-material/Clear';
import { Search } from '@mui/icons-material';

const SearchTextField = ({ searchText, setSearchText, placeholder }:
    { searchText: any, setSearchText: any, placeholder?: string }) => {
    const theme = useTheme();
    return (
        <TextField
            variant="standard"
            fullWidth
            margin='normal'
            placeholder={placeholder || "Ara..."} 
            value={searchText}
            autoComplete='off'
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
                padding: '.2rem',
                paddingLeft: '.5rem',
                paddingRight: '.5rem',
            }}
            InputProps={{
                disableUnderline: true,

                startAdornment: (
                    <InputAdornment sx={{ ml: 1 }} position="start">
                        <Search />
                    </InputAdornment>
                ),
                endAdornment: (
                    <>
                        {searchText && (
                            <InputAdornment position="end">
                                <ClearIcon onClick={() => setSearchText('')} sx={{ cursor: "pointer" }} />
                            </InputAdornment>
                        )}
                    </>
                ),
            }}
        />)
}

export default SearchTextField