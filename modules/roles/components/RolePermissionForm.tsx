import MenuItem from '@mui/material/MenuItem'
import {
  FormSelect,
  FormStack,
  FormSwitch,
  FormTextField,
} from '../../../src/components/ui/index.ts'
import type { Role } from '../lib/roleFromRecords.ts'
import {
  PERMISSION_ACTION_OPTIONS,
  type RolePermissionFormValues,
} from '../lib/permissionForm.ts'

export interface RolePermissionFormProps {
  values: RolePermissionFormValues
  onChange: (values: RolePermissionFormValues) => void
  roles: readonly Role[]
  disabled?: boolean
}

export function RolePermissionForm({
  values,
  onChange,
  roles,
  disabled = false,
}: RolePermissionFormProps) {
  const set = <K extends keyof RolePermissionFormValues>(
    key: K,
    value: RolePermissionFormValues[K],
  ) => onChange({ ...values, [key]: value })

  return (
    <FormStack>
      <FormTextField
        label="Label"
        value={values.label}
        onChange={(e) => set('label', e.target.value)}
        required
        disabled={disabled}
        placeholder="Users — read"
        helperText="Short name shown in lists"
      />
      <FormSelect
        labelId="permission-role-label"
        label="Role"
        value={values.roleId}
        onChange={(value) => set('roleId', value)}
        disabled={disabled}
        required
      >
        {roles.length === 0 ? (
          <MenuItem value="" disabled>
            No roles — create a role first
          </MenuItem>
        ) : (
          roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
              {!role.active ? ' (inactive)' : ''}
            </MenuItem>
          ))
        )}
      </FormSelect>
      <FormTextField
        label="Resource"
        value={values.resource}
        onChange={(e) => set('resource', e.target.value)}
        required
        disabled={disabled}
        placeholder="users"
        helperText="Resource identifier (e.g. table or feature key)"
      />
      <FormSelect
        labelId="permission-action-label"
        label="Action"
        value={values.action}
        onChange={(value) =>
          set('action', value as RolePermissionFormValues['action'])
        }
        disabled={disabled}
      >
        {PERMISSION_ACTION_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </FormSelect>
      <FormSwitch
        label="Allowed"
        checked={values.allowed}
        onChange={(checked) => set('allowed', checked)}
        disabled={disabled}
      />
    </FormStack>
  )
}
