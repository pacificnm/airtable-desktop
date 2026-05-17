import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import SecurityIcon from '@mui/icons-material/Security'
import {
  AddButton,
  ConfirmDeleteDialog,
  FormDrawer,
  RecordCollectionView,
  RecordListPage,
} from '../../../src/components/ui/index.ts'
import { useRecordViewMode } from '../../../src/hooks/useRecordViewMode.ts'
import { useToast } from '../../../src/hooks/useToast.ts'
import { RolePermissionForm } from '../components/RolePermissionForm.tsx'
import { useRolePermissions } from '../hooks/useRolePermissions.ts'
import { useRolePermissionsCrud } from '../hooks/useRolePermissionsCrud.ts'
import { useRoles } from '../hooks/useRoles.ts'
import {
  emptyRolePermissionFormValues,
  permissionToFormValues,
  validateRolePermissionFormValues,
  type RolePermissionFormValues,
} from '../lib/permissionForm.ts'
import type { RolePermission } from '../lib/permissionFromRecords.ts'
import { rolePermissionsCardLayout } from '../lib/rolePermissionsCardLayout.tsx'
import { rolePermissionsListColumns } from '../lib/rolePermissionsListColumns.tsx'

export default function RolePermissionsListScreen() {
  const toast = useToast()
  const { permissions, isLoading, isError, error, refetch } = useRolePermissions()
  const { roles } = useRoles()
  const crud = useRolePermissionsCrud()

  const roleNameById = useMemo(
    () => new Map(roles.map((r) => [r.id, r.name])),
    [roles],
  )

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<RolePermission | null>(null)
  const [values, setValues] = useState<RolePermissionFormValues>(
    emptyRolePermissionFormValues(),
  )
  const [validationError, setValidationError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RolePermission | null>(null)
  const [viewMode, setViewMode] = useRecordViewMode('rolePermissionsList')

  const cardLayout = useMemo(
    () => rolePermissionsCardLayout(roleNameById),
    [roleNameById],
  )

  const openCreate = () => {
    setEditingPermission(null)
    setValues(emptyRolePermissionFormValues())
    setValidationError(null)
    setDrawerOpen(true)
  }

  const openEdit = (permission: RolePermission) => {
    setEditingPermission(permission)
    setValues(permissionToFormValues(permission))
    setValidationError(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingPermission(null)
  }

  const saving = crud.createPermission.isPending || crud.updatePermission.isPending
  const mutationError =
    (crud.createPermission.error ?? crud.updatePermission.error)?.message ?? null

  const handleSave = async () => {
    const err = validateRolePermissionFormValues(values)
    if (err) {
      setValidationError(err)
      return
    }
    setValidationError(null)
    try {
      if (editingPermission) {
        await crud.updatePermission.mutateAsync({ id: editingPermission.id, values })
      } else {
        await crud.createPermission.mutateAsync(values)
      }
      toast.success(editingPermission ? 'Permission saved' : 'Permission created')
      closeDrawer()
    } catch {
      /* mutationError */
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await crud.deletePermission.mutateAsync(deleteTarget.id)
      toast.success(`Deleted "${deleteTarget.label}"`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete permission')
    }
  }

  return (
    <>
      <RecordListPage
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        header={{
          title: 'Role permissions',
          icon: <SecurityIcon color="primary" />,
          count: permissions.length,
          action: (
            <AddButton onClick={openCreate} disabled={roles.length === 0}>
              New permission
            </AddButton>
          ),
        }}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        banner={
          roles.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Create roles first under <strong>Access control → Roles</strong>, then add
              permissions here.
            </Alert>
          ) : undefined
        }
      >
        <RecordCollectionView<RolePermission>
          viewMode={viewMode}
          rows={permissions}
          getRowId={(permission) => permission.id}
          onRowClick={openEdit}
          emptyTitle="No permissions yet"
          emptyDescription='Click "New permission" after you have at least one role.'
          rowActions={{
            onEdit: openEdit,
            onDelete: (permission) => setDeleteTarget(permission),
            editAriaLabel: (permission) => `Edit ${permission.label}`,
            deleteAriaLabel: (permission) => `Delete ${permission.label}`,
          }}
          table={{ columns: rolePermissionsListColumns(roleNameById) }}
          card={cardLayout}
        />
      </RecordListPage>

      <FormDrawer
        open={drawerOpen}
        title={editingPermission ? 'Edit permission' : 'New permission'}
        onClose={closeDrawer}
        onSave={() => void handleSave()}
        saveLabel={editingPermission ? 'Save' : 'Create'}
        saving={saving}
        saveDisabled={!crud.canMutate || roles.length === 0}
        connectionWarning={!crud.canMutate ? 'Connect to Airtable to save changes.' : null}
        validationError={validationError}
        mutationError={mutationError}
      >
        {roles.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Create at least one role before adding permissions.
          </Alert>
        ) : null}
        <RolePermissionForm
          values={values}
          onChange={setValues}
          roles={roles}
          disabled={!crud.canMutate || saving}
        />
      </FormDrawer>

      <ConfirmDeleteDialog
        open={deleteTarget != null}
        title="Delete permission?"
        deleting={crud.deletePermission.isPending}
        onCancel={() => !crud.deletePermission.isPending && setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      >
        Remove permission <strong>{deleteTarget?.label}</strong>?
      </ConfirmDeleteDialog>
    </>
  )
}
