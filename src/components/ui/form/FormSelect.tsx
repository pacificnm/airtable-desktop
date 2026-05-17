import FormControl, { type FormControlProps } from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import type { ReactNode } from 'react'

export interface FormSelectProps extends Omit<FormControlProps, 'onChange'> {
  label: string
  labelId: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

export function FormSelect({
  label,
  labelId,
  value,
  onChange,
  children,
  fullWidth = true,
  size = 'small',
  ...props
}: FormSelectProps) {
  return (
    <FormControl fullWidth={fullWidth} size={size} {...props}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </Select>
    </FormControl>
  )
}
