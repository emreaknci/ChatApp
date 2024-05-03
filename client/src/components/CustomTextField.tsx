import { Edit, Save, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material'
import React, { useState } from 'react'

export interface CustomTextFieldProps {
  formik: any,
  fieldName: string,
  label?: string,
  type?: "text" | "password" | "email" | "number" | "date" | "month" | "week",
  disabled?: boolean,
  readonly?: boolean,
  color?: "primary" | "error" | "secondary" | "info" | "success" | "warning"
  variant?: "standard" | "outlined" | "filled",
  isEditable?: boolean
  handleEdit?: () => void,
  fullWidth?: boolean
  isEditing?: boolean
}

const CustomTextField = (props: CustomTextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {props.isEditable ?
        <>
          {props.isEditing ? <TextField
            fullWidth={props.fullWidth || true}
            margin="normal"
            id={props.fieldName}
            name={props.fieldName}
            label={props.label}
            type={showPassword ? 'text' : props.type}
            variant={props.variant || 'standard'}
            autoComplete="off"
            value={props.formik.values[props.fieldName]}
            onChange={props.formik.handleChange}
            error={(props.formik.touched[props.fieldName]) && Boolean(props.formik.errors[props.fieldName])}
            helperText={(props.formik.touched[props.fieldName]) && props.formik.errors[props.fieldName]}
            disabled={props.disabled}
            InputProps={{
              readOnly: props.readonly,
              endAdornment: (
                <>
                  {(props.type === 'password') &&
                    <InputAdornment position="end">
                      <IconButton onMouseDown={toggleShowPassword} onMouseUp={toggleShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>}

                </>
              ),
            }}
            color={props.color || 'primary'}
          /> :
            <strong>{props.formik.values[props.fieldName]} </strong>
          }
        </>
        :
        <TextField
          fullWidth
          margin="normal"
          id={props.fieldName}
          name={props.fieldName}
          label={props.label}
          type={showPassword ? 'text' : props.type}
          variant={props.variant || 'standard'}
          autoComplete={props.fieldName === 'password' || props.fieldName === 'confirmPassword' ? 'new-password' : 'off'}
          value={props.formik.values[props.fieldName]}
          onChange={props.formik.handleChange}
          error={(props.formik.touched[props.fieldName]) && Boolean(props.formik.errors[props.fieldName])}
          helperText={(props.formik.touched[props.fieldName]) && props.formik.errors[props.fieldName]}
          disabled={props.disabled}
          InputProps={{
            readOnly: props.readonly,
            endAdornment: (
              <>
                {(props.type === 'password') &&
                  <InputAdornment position="end">
                    <IconButton onMouseDown={toggleShowPassword} onMouseUp={toggleShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>}
              </>
            ),
          }}
          color={props.color || 'primary'}
        />}
    </>
  )
}

export default CustomTextField