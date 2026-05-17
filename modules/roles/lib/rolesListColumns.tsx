import { DataTableText, StatusChip, type DataTableColumn } from '../../../src/components/ui/index.ts'
import type { Role } from './roleFromRecords.ts'

export function rolesListColumns(): DataTableColumn<Role>[] {
  return [
    {
      id: 'name',
      label: 'Name',
      primary: true,
      render: (role) => <DataTableText>{role.name}</DataTableText>,
    },
    {
      id: 'description',
      label: 'Description',
      maxWidth: 360,
      render: (role) => (
        <DataTableText secondary title={role.description}>
          {role.description ?? '—'}
        </DataTableText>
      ),
    },
    {
      id: 'active',
      label: 'Active',
      render: (role) => <StatusChip active={role.active} />,
    },
  ]
}
