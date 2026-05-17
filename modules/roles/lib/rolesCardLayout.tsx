import { StatusChip, type RecordCardLayout } from '../../../src/components/ui/index.ts'
import type { Role } from './roleFromRecords.ts'

export function rolesCardLayout(): RecordCardLayout<Role> {
  return {
    title: (role) => role.name,
    subtitle: (role) => role.description ?? undefined,
    footer: (role) => <StatusChip active={role.active} />,
  }
}
