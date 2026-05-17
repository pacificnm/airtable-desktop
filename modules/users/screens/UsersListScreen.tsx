import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import PeopleIcon from '@mui/icons-material/People'
import LogoutIcon from '@mui/icons-material/Logout'
import { PageContainer } from '../../../src/components/main/PageContainer.tsx'
import { PageHeader } from '../../../src/components/main/PageHeader.tsx'
import { PageContents } from '../../../src/components/main/PageContents.tsx'
import { Loading } from '../../../src/components/main/Loading.tsx'
import { InlineError } from '../../../src/components/main/InlineError.tsx'
import {
  AddButton,
  ConfirmDeleteDialog,
  FormDrawer,
  LabelChip,
  RecordCollectionView,
  RecordViewToggle,
  TextButton,
} from '../../../src/components/ui/index.ts'
import { useRecordViewMode } from '../../../src/hooks/useRecordViewMode.ts'
import { useToast } from '../../../src/hooks/useToast.ts'
import { useRoles } from '../../roles/hooks/useRoles.ts'
import { AppUserForm } from '../components/AppUserForm.tsx'
import { CustomSignInForm } from '../components/CustomSignInForm.tsx'
import { UsersAuthSettings } from '../components/UsersAuthSettings.tsx'
import { useAppUsers } from '../hooks/useAppUsers.ts'
import { useAppUsersCrud } from '../hooks/useAppUsersCrud.ts'
import { useDirectoryUser } from '../hooks/useDirectoryUser.ts'
import { useUsersAuthConfig } from '../hooks/useUsersAuthConfig.ts'
import { useUsersModuleAuth } from '../hooks/useUsersModuleAuth.ts'
import {
  appUserToFormValues,
  emptyAppUserFormValues,
  validateAppUserFormValues,
  type AppUserFormValues,
} from '../lib/userForm.ts'
import type { AppUserRecord } from '../lib/userFromRecords.ts'
import { USERS_AUTH_PROVIDER_OPTIONS } from '../lib/usersAuthConfig.ts'
import { usersCardLayout } from '../lib/usersCardLayout.tsx'
import { usersListColumns } from '../lib/usersListColumns.tsx'

export default function UsersListScreen() {
  const toast = useToast()
  const { authProvider, extendOAuthProfiles } = useUsersAuthConfig()
  const directory = useDirectoryUser()
  const { users, isLoading, isError, error, refetch } = useAppUsers()
  const { roles } = useRoles()
  const crud = useAppUsersCrud(authProvider)
  const moduleAuth = useUsersModuleAuth(authProvider)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUserRecord | null>(null)
  const [values, setValues] = useState<AppUserFormValues>(emptyAppUserFormValues())
  const [validationError, setValidationError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppUserRecord | null>(null)
  const [signInError, setSignInError] = useState<string | null>(null)
  const [signInLoading, setSignInLoading] = useState(false)
  const [viewMode, setViewMode] = useRecordViewMode('usersList')

  const roleNameById = useMemo(
    () => new Map(roles.map((r) => [r.id, r.name])),
    [roles],
  )

  const cardLayout = useMemo(
    () => usersCardLayout(authProvider, roleNameById),
    [authProvider, roleNameById],
  )

  const providerLabel =
    USERS_AUTH_PROVIDER_OPTIONS.find((o) => o.value === authProvider)?.label ??
    authProvider

  const showUserDirectory =
    authProvider === 'airtable_oauth' ||
    (authProvider === 'custom_table' && moduleAuth.isCustomSignedIn)

  const openCreate = () => {
    setEditingUser(null)
    setValues(emptyAppUserFormValues())
    setValidationError(null)
    setDrawerOpen(true)
  }

  const openEdit = (user: AppUserRecord) => {
    setEditingUser(user)
    setValues(appUserToFormValues(user))
    setValidationError(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingUser(null)
  }

  const saving = crud.createUser.isPending || crud.updateUser.isPending
  const mutationError =
    (crud.createUser.error ?? crud.updateUser.error)?.message ?? null

  const handleSave = async () => {
    const err = validateAppUserFormValues(values, {
      authProvider,
      isEdit: editingUser != null,
    })
    if (err) {
      setValidationError(err)
      return
    }
    setValidationError(null)
    try {
      if (editingUser) {
        await crud.updateUser.mutateAsync({ id: editingUser.id, values })
      } else {
        await crud.createUser.mutateAsync(values)
      }
      toast.success(editingUser ? 'User saved' : 'User created')
      closeDrawer()
    } catch {
      /* mutationError */
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await crud.deleteUser.mutateAsync(deleteTarget.id)
      toast.success(`Deleted user "${deleteTarget.displayName}"`)
      if (moduleAuth.session?.userRecordId === deleteTarget.id) {
        moduleAuth.signOut()
      }
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete user')
    }
  }

  const handleCustomSignIn = async (login: string, password: string) => {
    setSignInLoading(true)
    setSignInError(null)
    try {
      await moduleAuth.signIn(login, password)
      toast.success('Signed in')
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setSignInLoading(false)
    }
  }

  return (
    <>
      <PageContainer>
        <PageHeader
          title="Users"
          icon={<PeopleIcon color="primary" />}
          count={showUserDirectory ? users.length : undefined}
          titleAddon={
            <LabelChip label={providerLabel} sx={{ ml: 0.5 }} />
          }
          action={
            showUserDirectory ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <RecordViewToggle value={viewMode} onChange={setViewMode} />
                {authProvider === 'custom_table' && moduleAuth.isCustomSignedIn ? (
                  <TextButton
                    startIcon={<LogoutIcon />}
                    onClick={() => {
                      moduleAuth.signOut()
                      toast.info('Signed out')
                    }}
                  >
                    Sign out
                  </TextButton>
                ) : null}
                <AddButton onClick={openCreate}>New user</AddButton>
              </Stack>
            ) : null
          }
        />
        <PageContents>
          <UsersAuthSettings />

          {authProvider === 'airtable_oauth' ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Using <strong>Airtable OAuth</strong> for identity (
              {directory.oauthShellUser.email ?? directory.oauthShellUser.displayName}).
              {extendOAuthProfiles
                ? ' Extended fields are stored in App Users and synced when you open this screen.'
                : ' App Users table is optional; enable “Extend OAuth profiles” to link rows.'}
            </Alert>
          ) : null}

          {moduleAuth.requiresCustomSignIn ? (
            <Box sx={{ py: 2 }}>
              <CustomSignInForm
                onSignIn={handleCustomSignIn}
                loading={signInLoading}
                error={signInError}
              />
              <Alert severity="info" sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
                Administrators manage users below after signing in. The Airtable connection
                (menu) is still used for API access; this sign-in controls app user identity.
              </Alert>
            </Box>
          ) : null}

          {showUserDirectory ? (
            <>
              {isLoading ? <Loading /> : null}
              {isError ? (
                <InlineError
                  message={error?.message ?? 'Failed to load users'}
                  onRetry={() => void refetch()}
                />
              ) : null}
              {!isLoading && !isError ? (
                <RecordCollectionView<AppUserRecord>
                  viewMode={viewMode}
                  rows={users}
                  getRowId={(user) => user.id}
                  onRowClick={openEdit}
                  emptyTitle="No users yet"
                  emptyDescription='Click "New user" to add someone.'
                  rowActions={{
                    onEdit: openEdit,
                    onDelete: (user) => setDeleteTarget(user),
                    editAriaLabel: (user) => `Edit ${user.displayName}`,
                    deleteAriaLabel: (user) => `Delete ${user.displayName}`,
                  }}
                  table={{ columns: usersListColumns(authProvider, roleNameById) }}
                  card={cardLayout}
                />
              ) : null}
            </>
          ) : null}
        </PageContents>
      </PageContainer>

      <FormDrawer
        open={drawerOpen}
        title={editingUser ? 'Edit user' : 'New user'}
        onClose={closeDrawer}
        onSave={() => void handleSave()}
        saveLabel={editingUser ? 'Save' : 'Create'}
        saving={saving}
        saveDisabled={!crud.canMutate}
        connectionWarning={!crud.canMutate ? 'Connect to Airtable to save changes.' : null}
        validationError={validationError}
        mutationError={mutationError}
      >
        <AppUserForm
          values={values}
          onChange={setValues}
          authProvider={authProvider}
          roles={roles}
          isEdit={editingUser != null}
          disabled={!crud.canMutate || saving}
        />
      </FormDrawer>

      <ConfirmDeleteDialog
        open={deleteTarget != null}
        title="Delete user?"
        deleting={crud.deleteUser.isPending}
        onCancel={() => !crud.deleteUser.isPending && setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      >
        Remove <strong>{deleteTarget?.displayName}</strong> from App Users?
      </ConfirmDeleteDialog>
    </>
  )
}
