import { FormStack, FormSwitch, FormTextField } from '../../../src/components/ui/index.ts'
import type { RoleFormValues } from '../lib/roleForm.ts'

export interface RoleFormProps {
  values: RoleFormValues
  onChange: (values: RoleFormValues) => void
  disabled?: boolean
}

export function RoleForm({ values, onChange, disabled = false }: RoleFormProps) {
  const set = <K extends keyof RoleFormValues>(key: K, value: RoleFormValues[K]) =>
    onChange({ ...values, [key]: value })

  return (
    <FormStack>
      <FormTextField
        label="Name"
        value={values.name}
        onChange={(e) => set('name', e.target.value)}
        required
        disabled={disabled}
        placeholder="Editor"
      />
      <FormTextField
        label="Description"
        value={values.description}
        onChange={(e) => set('description', e.target.value)}
        disabled={disabled}
        multiline
        minRows={3}
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
