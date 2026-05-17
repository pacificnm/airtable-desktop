import TextField, { type TextFieldProps } from '@mui/material/TextField'

export type FormTextFieldProps = TextFieldProps

/** Small full-width field for drawer forms. */
export function FormTextField({ size = 'small', fullWidth = true, ...props }: FormTextFieldProps) {
  return <TextField size={size} fullWidth={fullWidth} {...props} />
}
