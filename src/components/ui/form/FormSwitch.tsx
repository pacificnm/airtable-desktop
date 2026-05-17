import FormControlLabel, { type FormControlLabelProps } from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

export interface FormSwitchProps extends Omit<FormControlLabelProps, 'control' | 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function FormSwitch({ checked, onChange, disabled, label, ...props }: FormSwitchProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
      }
      label={label}
      {...props}
    />
  )
}
