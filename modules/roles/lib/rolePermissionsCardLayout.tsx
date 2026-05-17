import {
  DataTableText,
  LabelChip,
  StatusChip,
  type RecordCardLayout,
} from '../../../src/components/ui/index.ts'
import type { RolePermission } from './permissionFromRecords.ts'

export function rolePermissionsCardLayout(
  roleNameById: ReadonlyMap<string, string>,
): RecordCardLayout<RolePermission> {
  const roleLabel = (p: RolePermission): string => {
    const fromIds = p.roleIds
      .map((id) => roleNameById.get(id))
      .filter((name): name is string => Boolean(name))
    if (fromIds.length > 0) return fromIds.join(', ')
    if (p.roleNames.length > 0) return p.roleNames.join(', ')
    return '—'
  }

  return {
    title: (p) => p.label,
    subtitle: (p) => <DataTableText secondary>{roleLabel(p)}</DataTableText>,
    fields: [
      {
        id: 'resource',
        label: 'Resource',
        render: (p) => p.resource,
      },
      {
        id: 'action',
        label: 'Action',
        render: (p) => <LabelChip label={p.action} />,
      },
    ],
    footer: (p) => <StatusChip active={p.allowed} />,
  }
}
