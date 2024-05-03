import { Button, useTheme } from '@mui/material'
import React from 'react'

export interface CustomButtonProps {
    type: "submit" | "button" | "reset",
    fullWidth?: boolean,
    variant?: "text" | "outlined" | "contained",
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning",
    size?: "small" | "medium" | "large",
    disabled?: boolean,
    onClick?: () => void,
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    text: string
}

const CustomButton = (props: CustomButtonProps) => {
    const theme = useTheme()
    return (
        <Button
            type={props.type}
            fullWidth={props.fullWidth}
            variant={props.variant}
            color={props.color}
            size={props.size}
            disabled={props.disabled}
            onClick={props.onClick}
            startIcon={props.startIcon}
            endIcon={props.endIcon}
            sx={{
                marginTop: "1rem",
                ":hover": {
                    backgroundColor: theme.palette.primary.main,
                    transition: "background-color .5s ease"
                }
            }}
        >
            {props.text}
        </Button>
    )
}

export default CustomButton