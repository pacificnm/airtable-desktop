import MenuItem from '@mui/material/MenuItem'
import {
  FormSelect,
  FormStack,
  FormSwitch,
  FormTextField,
} from '../../../src/components/ui/index.ts'
import {
  CONFIG_VALUE_TYPE_OPTIONS,
  type ConfigEntryFormValues,
} from '../lib/configForm.ts'

export interface ConfigEntryFormProps {
  values: ConfigEntryFormValues
  onChange: (values: ConfigEntryFormValues) => void
  keyDisabled?: boolean
  disabled?: boolean
}

export function ConfigEntryForm({
  values,
  onChange,
  keyDisabled = false,
  disabled = false,
}: ConfigEntryFormProps) {
  const set = <K extends keyof ConfigEntryFormValues>(
    key: K,
    value: ConfigEntryFormValues[K],
  ) => onChange({ ...values, [key]: value })

  const valueMultiline = values.valueType === 'json'
  const valueRows = values.valueType === 'json' ? 6 : values.valueType === 'string' ? 3 : 2

  return (
    <FormStack>
      <FormTextField
        label="Key"
        value={values.key}
        onChange={(e) => set('key', e.target.value)}
        required
        disabled={disabled || keyDisabled}
        placeholder="module.roles.enabled"
        helperText={keyDisabled ? 'Key cannot be changed after create.' : undefined}
      />
      <FormSelect
        labelId="config-value-type-label"
        label="Value type"
        value={values.valueType}
        onChange={(value) =>
          set('valueType', value as ConfigEntryFormValues['valueType'])
        }
        disabled={disabled}
      >
        {CONFIG_VALUE_TYPE_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </FormSelect>
      <FormTextField
        label="Value"
        value={values.value}
        onChange={(e) => set('value', e.target.value)}
        disabled={disabled}
        multiline={valueMultiline || values.valueType === 'string'}
        minRows={valueRows}
        placeholder={
          values.valueType === 'boolean'
            ? 'true or false'
            : values.valueType === 'json'
              ? '{"enabled": true}'
              : undefined
        }
      />
      <FormTextField
        label="Label"
        value={values.label}
        onChange={(e) => set('label', e.target.value)}
        disabled={disabled}
      />
      <FormTextField
        label="Description"
        value={values.description}
        onChange={(e) => set('description', e.target.value)}
        disabled={disabled}
        multiline
        minRows={2}
      />
      <FormTextField
        label="Module"
        value={values.module}
        onChange={(e) => set('module', e.target.value)}
        disabled={disabled}
        placeholder="config"
      />
      <FormSwitch
        label="Active"
        checked={values.active}
        onChange={(checked) => set('active', checked)}
        disabled={disabled}
      />
    </FormStack>
  )
}
