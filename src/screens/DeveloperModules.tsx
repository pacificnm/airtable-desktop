import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { getScreenTitle } from '../config/screens.ts'
import {
  applyModuleChange,
  reloadAppForModuleChange,
} from '../lib/modules/applyModuleChange.ts'
import { getElectronModulesBridge } from '../lib/modules/electronModulesBridge.ts'
import {
  clearModuleOverrideIds,
  disableModule,
  enableModule,
  getBuiltInEnabledModuleIds,
  getEffectiveEnabledModuleIds,
  hasModuleOverride,
  writeModuleOverrideIds,
} from '../lib/modules/modulePreferences.ts'
import {
  getDiscoveredModules,
  isModuleEnabled,
} from '../lib/modules/registry.ts'
import {
  getModuleDependencies,
  moduleDependencyProvisionBlockers,
} from '../lib/modules/moduleDependencies.ts'
import { moduleNeedsTableProvisioning } from '../lib/modules/moduleProvisioningState.ts'
import { provisionModuleTables } from '../lib/modules/provisionModuleTables.ts'
import {
  getUninstallBlockers,
  uninstallModule,
  UninstallModuleError,
} from '../lib/modules/uninstallModule.ts'
import { useAirtable } from '../hooks/useAirtable.ts'
import { useToast } from '../hooks/useToast.ts'

export default function DeveloperModules() {
  const modules = getDiscoveredModules()
  const toast = useToast()
  const { client, isReady } = useAirtable()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [uninstallTarget, setUninstallTarget] = useState<string | null>(null)
  const canSyncFile = useMemo(() => getElectronModulesBridge() !== null, [])
  const canResetTableFiles = useMemo(
    () => getElectronModulesBridge()?.resetModuleTableIds != null,
    [],
  )

  const provisionTables = async (moduleId: string): Promise<boolean> => {
    if (!client || !isReady) {
      toast.warning('Connect your base first (base id + OAuth or PAT).')
      return false
    }
    if (!moduleNeedsTableProvisioning(moduleId)) {
      return true
    }
    try {
      const result = await provisionModuleTables(client, moduleId)
      const created = result.tables.filter((t) => t.status === 'created')
      const existing = result.tables.filter((t) => t.status === 'existing')
      const parts: string[] = []
      if (created.length) parts.push(`created ${created.length} table(s)`)
      if (existing.length) parts.push(`reused ${existing.length} existing`)
      toast.success(
        parts.length ? `Airtable: ${parts.join(', ')}` : 'Tables are ready',
      )
      return true
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create Airtable tables',
      )
      return false
    }
  }

  const effectiveIds = getEffectiveEnabledModuleIds()
  const usingOverride = hasModuleOverride()
  const builtInIds = getBuiltInEnabledModuleIds()

  const applyAndReload = async (
    ids: readonly string[],
    syncProjectFile: boolean,
  ) => {
    await applyModuleChange(ids, { syncProjectFile })
    toast.info('Reloading to apply module changes…')
    reloadAppForModuleChange()
  }

  const handleEnable = async (moduleId: string) => {
    setBusyId(moduleId)
    try {
      const ids = enableModule(moduleId)
      const tablesOk = await provisionTables(moduleId)
      if (!tablesOk) {
        setBusyId(null)
        return
      }
      await applyAndReload(ids, canSyncFile)
    } catch (err) {
      setBusyId(null)
      toast.error(err instanceof Error ? err.message : 'Failed to enable module')
    }
  }

  const handleCreateTables = async (moduleId: string) => {
    setBusyId(`${moduleId}:tables`)
    try {
      const ok = await provisionTables(moduleId)
      if (ok) {
        toast.info('Reloading to apply table ids…')
        reloadAppForModuleChange()
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleDisable = async (moduleId: string) => {
    setBusyId(moduleId)
    try {
      const ids = disableModule(moduleId)
      await applyAndReload(ids, canSyncFile)
    } catch (err) {
      setBusyId(null)
      toast.error(err instanceof Error ? err.message : 'Failed to disable module')
    }
  }

  const handleUninstallConfirm = async () => {
    if (!uninstallTarget) return
    const moduleId = uninstallTarget
    setBusyId(`${moduleId}:uninstall`)
    try {
      const result = await uninstallModule(
        moduleId,
        client && isReady ? client : null,
      )
      setUninstallTarget(null)
      const parts = ['Module uninstalled']
      if (result.configRowsRemoved > 0) {
        parts.push(`${result.configRowsRemoved} App Config row(s) removed`)
      }
      if (result.tablesFileReset) {
        parts.push('tables.ts reset to placeholders')
      } else if (!canResetTableFiles) {
        parts.push('reset table ids in modules/*/tables.ts manually to reinstall')
      }
      toast.success(parts.join(' · '))
      await applyAndReload(result.enabledModuleIds, canSyncFile)
    } catch (err) {
      setBusyId(null)
      if (err instanceof UninstallModuleError && err.code === 'dependents') {
        toast.error(err.message)
      } else {
        toast.error(err instanceof Error ? err.message : 'Uninstall failed')
      }
    }
  }

  const handleResetToFile = async () => {
    setBusyId('__reset__')
    try {
      clearModuleOverrideIds()
      await applyAndReload(builtInIds, false)
    } catch (err) {
      setBusyId(null)
      toast.error(err instanceof Error ? err.message : 'Failed to reset')
    }
  }

  const handleSyncFileOnly = async () => {
    setBusyId('__sync__')
    try {
      writeModuleOverrideIds(effectiveIds)
      await applyAndReload(effectiveIds, true)
    } catch (err) {
      setBusyId(null)
      toast.error(err instanceof Error ? err.message : 'Failed to sync file')
    }
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {getScreenTitle('devModules')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enable or disable modules with one click. When connected, the app creates
        module tables in your Airtable base automatically (requires{' '}
        <code>schema.bases:write</code>). The app reloads to register routes and menu
        items. Use <strong>Uninstall</strong> to clear provisioning state and reinstall
        cleanly. In Electron dev, changes also update <code>enabledModules.ts</code> and{' '}
        <code>modules/*/tables.ts</code>.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Source:{' '}
        {usingOverride ? (
          <>browser override (Developer → Modules)</>
        ) : (
          <>
            <code>enabledModules.ts</code>
          </>
        )}
        {canSyncFile ? (
          <> — file sync available in this session.</>
        ) : (
          <> — run via Electron dev to auto-update the project file.</>
        )}
      </Alert>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 3, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <Typography variant="subtitle2">Enabled now</Typography>
        {effectiveIds.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        ) : (
          effectiveIds.map((id) => (
            <Chip key={id} label={id} color="primary" size="small" />
          ))
        )}
        {usingOverride ? (
          <Button
            size="small"
            color="inherit"
            disabled={busyId !== null}
            onClick={() => void handleResetToFile()}
          >
            Reset to file
          </Button>
        ) : null}
        {canSyncFile && effectiveIds.length > 0 ? (
          <Button
            size="small"
            variant="outlined"
            disabled={busyId !== null}
            onClick={() => void handleSyncFileOnly()}
          >
            Save to enabledModules.ts
          </Button>
        ) : null}
      </Stack>

      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Installed modules ({modules.length})
      </Typography>

      {modules.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No modules found. Add a folder under <code>modules/&lt;id&gt;/index.ts</code>.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {modules.map(({ definition, rootPath }) => {
            const enabled = isModuleEnabled(definition.id)
            const busy = busyId === definition.id || busyId === `${definition.id}:tables`
            const needsTables =
              Boolean(definition.tableBlueprints?.length) &&
              moduleNeedsTableProvisioning(definition.id)
            const deps = getModuleDependencies(definition.id)
            const depBlockers = moduleDependencyProvisionBlockers(definition.id)
            const uninstallBlockers = getUninstallBlockers(definition.id)
            const canUninstall =
              uninstallBlockers.length === 0 &&
              Boolean(definition.tableBlueprints?.length)
            return (
              <Paper key={definition.id} variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 0.5, alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Typography variant="subtitle1" component="h2">
                    {definition.name}
                  </Typography>
                  <Chip
                    label={enabled ? 'Enabled' : 'Disabled'}
                    size="small"
                    color={enabled ? 'success' : 'default'}
                    variant={enabled ? 'filled' : 'outlined'}
                  />
                  <Chip label={`v${definition.version}`} size="small" variant="outlined" />
                  {deps.length > 0 ? (
                    <Chip
                      label={`requires: ${deps.join(', ')}`}
                      size="small"
                      variant="outlined"
                      color={depBlockers.length > 0 ? 'warning' : 'default'}
                    />
                  ) : null}
                  <Box sx={{ flex: 1 }} />
                  {enabled && needsTables ? (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={busy || busyId !== null || !isReady}
                      onClick={() => void handleCreateTables(definition.id)}
                    >
                      Create tables
                    </Button>
                  ) : null}
                  {canUninstall ? (
                    <Button
                      size="small"
                      color="warning"
                      disabled={busy || busyId !== null}
                      onClick={() => setUninstallTarget(definition.id)}
                    >
                      Uninstall
                    </Button>
                  ) : null}
                  {enabled ? (
                    <Button
                      size="small"
                      color="inherit"
                      disabled={busy || busyId !== null}
                      onClick={() => void handleDisable(definition.id)}
                    >
                      {busy ? 'Applying…' : 'Disable'}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={busy || busyId !== null}
                      onClick={() => void handleEnable(definition.id)}
                    >
                      {busy ? 'Applying…' : 'Enable'}
                    </Button>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {rootPath} · id: <code>{definition.id}</code>
                </Typography>
                {definition.description ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {definition.description}
                  </Typography>
                ) : null}
                {definition.tableBlueprints?.length ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {needsTables
                      ? 'Tables not provisioned yet — enable while connected or use Create tables.'
                      : 'Airtable tables linked.'}{' '}
                    Schema: <code>{rootPath}/blueprints.ts</code>
                    {depBlockers.length > 0 ? (
                      <>
                        {' '}
                        Blocked until: {depBlockers.join('; ')}.
                      </>
                    ) : null}
                  </Typography>
                ) : null}
                {uninstallBlockers.length > 0 ? (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    {uninstallBlockers[0]}
                  </Typography>
                ) : null}
              </Paper>
            )
          })}
        </Stack>
      )}

      <Dialog
        open={uninstallTarget != null}
        onClose={() => busyId?.endsWith(':uninstall') !== true && setUninstallTarget(null)}
      >
        <DialogTitle>
          Uninstall {uninstallTarget ? modules.find((m) => m.definition.id === uninstallTarget)?.definition.name : 'module'}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>This will:</DialogContentText>
            <Box component="ul" sx={{ mt: 1, mb: 2, pl: 2.5 }}>
              <li>Disable the module and remove it from the enabled list</li>
              <li>Clear local provisioning state (browser storage)</li>
              <li>
                Remove its App Config rows (<code>module.{uninstallTarget}.*</code>) when
                connected
              </li>
              {canResetTableFiles ? (
                <li>
                  Reset <code>modules/{uninstallTarget}/tables.ts</code> to placeholder table
                  ids
                </li>
              ) : (
                <li>
                  Manually set placeholder table ids in <code>modules/{uninstallTarget}/tables.ts</code>{' '}
                  before reinstalling
                </li>
              )}
            </Box>
          <DialogContentText>
            Airtable tables in your base are <strong>not</strong> deleted. After uninstall,
            use <strong>Enable</strong> to provision again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            disabled={busyId?.endsWith(':uninstall') === true}
            onClick={() => setUninstallTarget(null)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={busyId?.endsWith(':uninstall') === true}
            onClick={() => void handleUninstallConfirm()}
          >
            {busyId?.endsWith(':uninstall') ? 'Uninstalling…' : 'Uninstall'}
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        See <strong>Developer → Documentation → Modules</strong> and{' '}
        <code>docs/modules.md</code>.
      </Typography>
    </Box>
  )
}
