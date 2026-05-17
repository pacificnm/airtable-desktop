import { useState } from 'react'
import Alert from '@mui/material/Alert'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  AddButton,
  ConfirmDeleteDialog,
  FormDrawer,
  RecordCollectionView,
  RecordListPage,
} from '../../../src/components/ui/index.ts'
import { useRecordViewMode } from '../../../src/hooks/useRecordViewMode.ts'
import { useToast } from '../../../src/hooks/useToast.ts'
import { ConfigEntryForm } from '../components/ConfigEntryForm.tsx'
import { useAppConfig } from '../hooks/useAppConfig.ts'
import { useAppConfigCrud } from '../hooks/useAppConfigCrud.ts'
import {
  configEntryToFormValues,
  emptyConfigFormValues,
  validateConfigFormValues,
  type ConfigEntryFormValues,
} from '../lib/configForm.ts'
import { configCardLayout } from '../lib/configCardLayout.tsx'
import { configListColumns } from '../lib/configListColumns.tsx'
import type { ConfigEntry } from '../lib/configFromRecords.ts'
import { moduleEnabledConfigKey } from '../validation/config.ts'

export default function ConfigListScreen() {
  const toast = useToast()
  const { entries, isLoading, isError, error, refetch } = useAppConfig()
  const crud = useAppConfigCrud()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ConfigEntry | null>(null)
  const [values, setValues] = useState<ConfigEntryFormValues>(emptyConfigFormValues())
  const [validationError, setValidationError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ConfigEntry | null>(null)
  const [viewMode, setViewMode] = useRecordViewMode('configList')

  const openCreate = () => {
    setEditingEntry(null)
    setValues(emptyConfigFormValues())
    setValidationError(null)
    setDrawerOpen(true)
  }

  const openEdit = (entry: ConfigEntry) => {
    setEditingEntry(entry)
    setValues(configEntryToFormValues(entry))
    setValidationError(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingEntry(null)
  }

  const saving = crud.createEntry.isPending || crud.updateEntry.isPending
  const mutationError =
    (crud.createEntry.error ?? crud.updateEntry.error)?.message ?? null

  const handleSave = async () => {
    const err = validateConfigFormValues(values)
    if (err) {
      setValidationError(err)
      return
    }
    setValidationError(null)
    try {
      if (editingEntry) {
        await crud.updateEntry.mutateAsync({ id: editingEntry.id, values })
      } else {
        await crud.createEntry.mutateAsync(values)
      }
      toast.success(editingEntry ? 'Config saved' : 'Config created')
      closeDrawer()
    } catch {
      /* mutationError */
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await crud.deleteEntry.mutateAsync(deleteTarget.id)
      toast.success(`Deleted "${deleteTarget.key}"`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete config row')
    }
  }

  return (
    <>
      <RecordListPage
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        header={{
          title: 'App config',
          icon: <SettingsIcon color="primary" />,
          count: entries.length,
          action: <AddButton onClick={openCreate}>New config</AddButton>,
        }}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        banner={
          <Alert severity="info" sx={{ mb: 2 }}>
            Key–value settings for the app and modules. Toggle a module at runtime with
            row <code>{moduleEnabledConfigKey('roles')}</code> (boolean, Active checked).
            Install/remove modules in <strong>Developer → Modules</strong>.
          </Alert>
        }
      >
        <RecordCollectionView<ConfigEntry>
          viewMode={viewMode}
          rows={entries}
          getRowId={(entry) => entry.id}
          onRowClick={openEdit}
          emptyTitle="No config rows yet"
          emptyDescription='Click "New config" to add your first setting.'
          rowActions={{
            onEdit: openEdit,
            onDelete: (entry) => setDeleteTarget(entry),
            editAriaLabel: (entry) => `Edit ${entry.key}`,
            deleteAriaLabel: (entry) => `Delete ${entry.key}`,
          }}
          table={{ columns: configListColumns() }}
          card={configCardLayout()}
        />
      </RecordListPage>

      <FormDrawer
        open={drawerOpen}
        title={editingEntry ? 'Edit config' : 'New config'}
        onClose={closeDrawer}
        onSave={() => void handleSave()}
        saveLabel={editingEntry ? 'Save' : 'Create'}
        saving={saving}
        saveDisabled={!crud.canMutate}
        connectionWarning={!crud.canMutate ? 'Connect to Airtable to save changes.' : null}
        validationError={validationError}
        mutationError={mutationError}
      >
        <ConfigEntryForm
          values={values}
          onChange={setValues}
          keyDisabled={editingEntry != null}
          disabled={!crud.canMutate || saving}
        />
      </FormDrawer>

      <ConfirmDeleteDialog
        open={deleteTarget != null}
        title="Delete config row?"
        deleting={crud.deleteEntry.isPending}
        onCancel={() => !crud.deleteEntry.isPending && setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      >
        Remove <strong>{deleteTarget?.key}</strong>? Apps reading this key will fall back
        to defaults.
      </ConfirmDeleteDialog>
    </>
  )
}
