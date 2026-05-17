import {
  DataTableText,
  LabelChip,
  StatusChip,
  type DataTableColumn,
} from '../../../src/components/ui/index.ts'
import type { RolePermission } from './permissionFromRecords.ts'

function roleDisplay(
  permission: RolePermission,
  roleNameById: ReadonlyMap<string, string>,
): string {
  const fromIds = permission.roleIds
    .map((id) => roleNameById.get(id))
    .filter((name): name is string => Boolean(name))
  if (fromIds.length > 0) return fromIds.join(', ')
  if (permission.roleNames.length > 0) return permission.roleNames.join(', ')
  return '—'
}

export function rolePermissionsListColumns(
  roleNameById: ReadonlyMap<string, string>,
): DataTableColumn<RolePermission>[] {
  return [
    {
      id: 'label',
      label: 'Label',
      primary: true,
      render: (p) => <DataTableText title={p.label}>{p.label}</DataTableText>,
    },
    {
      id: 'role',
      label: 'Role',
      render: (p) => <DataTableText secondary>{roleDisplay(p, roleNameById)}</DataTableText>,
    },
    {
      id: 'resource',
      label: 'Resource',
      render: (p) => <DataTableText>{p.resource}</DataTableText>,
    },
    {
      id: 'action',
      label: 'Action',
      render: (p) => <LabelChip label={p.action} />,
    },
    {
      id: 'allowed',
      label: 'Allowed',
      render: (p) => <StatusChip active={p.allowed} />,
    },
  ]
}
