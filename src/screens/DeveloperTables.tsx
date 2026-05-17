import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import { Action } from '../components/button/Action.tsx'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { DataTable, type DataTableColumn } from '../components/ui/index.ts'
import { getScreenTitle } from '../config/screens.ts'
import {
  airtableTables,
  getConfiguredTables,
  tableScreens,
  type AirtableTableEntry,
} from '../config/tables.ts'
import { TableDetailFlyout } from '../components/developer/TableDetailFlyout.tsx'
import { useTableSchemaLookup } from '../hooks/useTableSchemaLookup.ts'
import type { MetaTableSchema } from '../lib/airtable/metaTypes.ts'
import { AirtableApiError } from '../lib/airtable/errors.ts'

const configuredTableColumns: DataTableColumn<AirtableTableEntry>[] = [
  {
    id: 'key',
    label: 'Key',
    render: (t) => <code>{t.key}</code>,
  },
  {
    id: 'label',
    label: 'Label',
    render: (t) => t.label,
  },
  {
    id: 'tableId',
    label: 'Table ID',
    render: (t) => <code>{t.tableId}</code>,
  },
  {
    id: 'screens',
    label: 'Screens',
    render: (t) => {
      const screens = tableScreens(t)
      if (!screens?.length) {
        return (
          <Typography variant="caption" color="text.secondary" component="span">
            —
          </Typography>
        )
      }
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {screens.map((s) => (
            <Chip key={s} label={s} size="small" variant="outlined" />
          ))}
        </Box>
      )
    },
  },
  {
    id: 'primaryField',
    label: 'Primary field',
    render: (t) => t.primaryField ?? '—',
  },
]

export default function DeveloperTables() {
  const { lookupByTableId, loading, error, isReady, baseId } =
    useTableSchemaLookup()

  const [tableIdInput, setTableIdInput] = useState('')
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [flyoutTable, setFlyoutTable] = useState<MetaTableSchema | null>(null)
  const [flyoutError, setFlyoutError] = useState<string | null>(null)
  const [flyoutLoading, setFlyoutLoading] = useState(false)

  const openLookup = useCallback(
    async (tableId: string) => {
      setFlyoutOpen(true)
      setFlyoutTable(null)
      setFlyoutError(null)
      setFlyoutLoading(true)
      try {
        const table = await lookupByTableId(tableId)
        setFlyoutTable(table)
      } catch (err) {
        if (!(err instanceof AirtableApiError)) {
          setFlyoutError(
            err instanceof Error ? err.message : 'Lookup failed',
          )
        } else {
          setFlyoutError(err.message)
        }
      } finally {
        setFlyoutLoading(false)
      }
    },
    [lookupByTableId],
  )

  const handleLookupSubmit = () => {
    void openLookup(tableIdInput)
  }

  const handleCloseFlyout = () => {
    setFlyoutOpen(false)
    setFlyoutTable(null)
    setFlyoutError(null)
  }

  const configuredTables = getConfiguredTables()

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        {getScreenTitle('devTables')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Look up a table by id to generate a complete config (every column in{' '}
        <code>fields</code> and <code>columns</code>). Paste into{' '}
        <code>src/config/tables.ts</code>, or click a configured row to refresh.
      </Typography>

      {!isReady && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Connect Airtable (menu → Airtable connection) with a base id and token
          that includes <code>schema.bases:read</code>.
          {baseId ? ` Base: ${baseId}` : ''}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 3, maxWidth: 520 }}>
        <TextField
          size="small"
          fullWidth
          label="Table ID"
          placeholder="tblBBSw4OOrkafBbd"
          value={tableIdInput}
          onChange={(e) => setTableIdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLookupSubmit()
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Action
          onClick={handleLookupSubmit}
          disabled={!tableIdInput.trim()}
          loading={loading}
        >
          Look up
        </Action>
      </Box>

      {error && !flyoutOpen && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Configured tables
      </Typography>
      {airtableTables.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No tables in config yet. Paste into <code>coreAirtableTables</code> in{' '}
          <code>src/config/tables.ts</code>, or enable a module (Developer →
          Modules).
        </Typography>
      )}
      <DataTable
        rows={configuredTables}
        columns={configuredTableColumns}
        getRowId={(t) => t.key}
        onRowClick={isReady ? (t) => void openLookup(t.tableId) : undefined}
        emptyTitle="No configured tables"
        emptyDescription="Add entries to coreAirtableTables in src/config/tables.ts or enable a module."
      />

      <TableDetailFlyout
        open={flyoutOpen}
        onClose={handleCloseFlyout}
        table={flyoutTable}
        loading={flyoutLoading}
        error={flyoutError}
      />
    </Box>
  )
}
