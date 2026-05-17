import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { mapConfigToAirtableFields } from '../../../src/lib/airtable/mapRecordFields.ts'
import type { Role } from './roleFromRecords.ts'

export interface RoleFormValues {
  name: string
  description: string
  active: boolean
}

export function emptyRoleFormValues(): RoleFormValues {
  return { name: '', description: '', active: true }
}

export function roleToFormValues(role: Role): RoleFormValues {
  return {
    name: role.name,
    description: role.description ?? '',
    active: role.active,
  }
}

export function roleFormValuesToAirtableFields(
  config: AirtableTableConfig,
  values: RoleFormValues,
): Record<string, unknown> {
  return mapConfigToAirtableFields(config, {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    active: values.active,
  })
}

export function validateRoleFormValues(values: RoleFormValues): string | null {
  if (!values.name.trim()) return 'Name is required.'
  return null
}
