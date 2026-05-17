import {
  DataTableText,
  LabelChip,
  StatusChip,
  type DataTableColumn,
} from '../../../src/components/ui/index.ts'
import { resolveLinkedRecordLabels } from '../../roles/lib/linkedRecords.ts'
import type { AppUserRecord } from './userFromRecords.ts'
import type { UsersAuthProvider } from './usersAuthConfig.ts'

function roleDisplay(
  user: AppUserRecord,
  roleNameById: ReadonlyMap<string, string>,
): string {
  const fromIds = resolveLinkedRecordLabels(user.roleIds, roleNameById)
  if (fromIds.length > 0) return fromIds.join(', ')
  if (user.roleNames.length > 0) return user.roleNames.join(', ')
  return '—'
}

export function usersListColumns(
  authProvider: UsersAuthProvider,
  roleNameById: ReadonlyMap<string, string>,
): DataTableColumn<AppUserRecord>[] {
  const authColumn: DataTableColumn<AppUserRecord> =
    authProvider === 'airtable_oauth'
      ? {
          id: 'airtableUserId',
          label: 'Airtable id',
          render: (user) => (
            <DataTableText mono title={user.airtableUserId}>
              {user.airtableUserId ?? '—'}
            </DataTableText>
          ),
        }
      : {
          id: 'auth',
          label: 'Auth',
          render: (user) => (
            <LabelChip label={user.hasPassword ? 'Password set' : 'No password'} />
          ),
        }

  return [
    {
      id: 'email',
      label: 'Email',
      maxWidth: 200,
      render: (user) => (
        <DataTableText title={user.email}>{user.email || '—'}</DataTableText>
      ),
    },
    {
      id: 'displayName',
      label: 'Name',
      primary: true,
      render: (user) => <DataTableText>{user.displayName}</DataTableText>,
    },
    {
      id: 'username',
      label: 'Username',
      render: (user) => (
        <DataTableText secondary>{user.username ?? '—'}</DataTableText>
      ),
    },
    authColumn,
    {
      id: 'role',
      label: 'Role',
      render: (user) => (
        <DataTableText secondary>{roleDisplay(user, roleNameById)}</DataTableText>
      ),
    },
    {
      id: 'active',
      label: 'Active',
      render: (user) => <StatusChip active={user.active} />,
    },
  ]
}
