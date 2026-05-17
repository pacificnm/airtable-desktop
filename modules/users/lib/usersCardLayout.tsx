import {
  DataTableText,
  LabelChip,
  StatusChip,
  type RecordCardLayout,
} from '../../../src/components/ui/index.ts'
import { resolveLinkedRecordLabels } from '../../roles/lib/linkedRecords.ts'
import type { AppUserRecord } from './userFromRecords.ts'
import type { UsersAuthProvider } from './usersAuthConfig.ts'

export function usersCardLayout(
  authProvider: UsersAuthProvider,
  roleNameById: ReadonlyMap<string, string>,
): RecordCardLayout<AppUserRecord> {
  const roleLabel = (user: AppUserRecord): string => {
    const fromIds = resolveLinkedRecordLabels(user.roleIds, roleNameById)
    if (fromIds.length > 0) return fromIds.join(', ')
    if (user.roleNames.length > 0) return user.roleNames.join(', ')
    return '—'
  }

  return {
    title: (user) => user.displayName,
    subtitle: (user) => user.email || user.username || undefined,
    fields: [
      ...(authProvider === 'airtable_oauth'
        ? [
            {
              id: 'airtableUserId',
              label: 'Airtable id',
              render: (user: AppUserRecord) => (
                <DataTableText mono>{user.airtableUserId ?? '—'}</DataTableText>
              ),
            },
          ]
        : [
            {
              id: 'auth',
              label: 'Auth',
              render: (user: AppUserRecord) => (
                <LabelChip
                  label={user.hasPassword ? 'Password set' : 'No password'}
                />
              ),
            },
          ]),
      {
        id: 'role',
        label: 'Role',
        render: (user) => roleLabel(user),
      },
    ],
    footer: (user) => <StatusChip active={user.active} />,
  }
}
