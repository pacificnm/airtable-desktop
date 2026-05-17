import { useState } from 'react'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import {
  AddButton,
  ConfirmDeleteDialog,
  FormDrawer,
  RecordCollectionView,
  RecordListPage,
} from '../../../src/components/ui/index.ts'
import { useRecordViewMode } from '../../../src/hooks/useRecordViewMode.ts'
import { useToast } from '../../../src/hooks/useToast.ts'
import { RoleForm } from '../components/RoleForm.tsx'
import { useRoles } from '../hooks/useRoles.ts'
import { useRolesCrud } from '../hooks/useRolesCrud.ts'
import {
  emptyRoleFormValues,
  roleToFormValues,
  validateRoleFormValues,
  type RoleFormValues,
} from '../lib/roleForm.ts'
import type { Role } from '../lib/roleFromRecords.ts'
import { rolesCardLayout } from '../lib/rolesCardLayout.tsx'
import { rolesListColumns } from '../lib/rolesListColumns.tsx'

export default function RolesListScreen() {
  const toast = useToast()
  const { roles, isLoading, isError, error, refetch } = useRoles()
  const crud = useRolesCrud()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [values, setValues] = useState<RoleFormValues>(emptyRoleFormValues())
  const [validationError, setValidationError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [viewMode, setViewMode] = useRecordViewMode('rolesList')

  const openCreate = () => {
    setEditingRole(null)
    setValues(emptyRoleFormValues())
    setValidationError(null)
    setDrawerOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditingRole(role)
    setValues(roleToFormValues(role))
    setValidationError(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingRole(null)
  }

  const saving = crud.createRole.isPending || crud.updateRole.isPending
  const mutationError =
    (crud.createRole.error ?? crud.updateRole.error)?.message ?? null

  const handleSave = async () => {
    const err = validateRoleFormValues(values)
    if (err) {
      setValidationError(err)
      return
    }
    setValidationError(null)
    try {
      if (editingRole) {
        await crud.updateRole.mutateAsync({ id: editingRole.id, values })
      } else {
        await crud.createRole.mutateAsync(values)
      }
      toast.success(editingRole ? 'Role saved' : 'Role created')
      closeDrawer()
    } catch {
      /* mutationError */
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await crud.deleteRole.mutateAsync(deleteTarget.id)
      toast.success(`Deleted role "${deleteTarget.name}"`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete role')
    }
  }

  return (
    <>
      <RecordListPage
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        header={{
          title: 'Roles',
          icon: <AdminPanelSettingsIcon color="primary" />,
          count: roles.length,
          action: <AddButton onClick={openCreate}>New role</AddButton>,
        }}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
      >
        <RecordCollectionView<Role>
          viewMode={viewMode}
          rows={roles}
          getRowId={(role) => role.id}
          onRowClick={openEdit}
          emptyTitle="No roles yet"
          emptyDescription='Click "New role" to create your first role.'
          rowActions={{
            onEdit: openEdit,
            onDelete: (role) => setDeleteTarget(role),
            editAriaLabel: (role) => `Edit ${role.name}`,
            deleteAriaLabel: (role) => `Delete ${role.name}`,
          }}
          table={{ columns: rolesListColumns() }}
          card={rolesCardLayout()}
        />
      </RecordListPage>

      <FormDrawer
        open={drawerOpen}
        title={editingRole ? 'Edit role' : 'New role'}
        onClose={closeDrawer}
        onSave={() => void handleSave()}
        saveLabel={editingRole ? 'Save' : 'Create'}
        saving={saving}
        saveDisabled={!crud.canMutate}
        connectionWarning={!crud.canMutate ? 'Connect to Airtable to save changes.' : null}
        validationError={validationError}
        mutationError={mutationError}
      >
        <RoleForm values={values} onChange={setValues} disabled={!crud.canMutate || saving} />
      </FormDrawer>

      <ConfirmDeleteDialog
        open={deleteTarget != null}
        title="Delete role?"
        deleting={crud.deleteRole.isPending}
        onCancel={() => !crud.deleteRole.isPending && setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      >
        Remove role <strong>{deleteTarget?.name}</strong>? Linked permissions may become
        invalid in Airtable.
      </ConfirmDeleteDialog>
    </>
  )
}
