import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  DataTable,
  DataTableText,
  type DataTableColumn,
} from '@/components/ui/index.ts'
import { getScreenTitle } from '@/config/screens.ts'
import { useBaseSchema } from '@/hooks/useBaseSchema.ts'
import { useAirtable } from '@/hooks/useAirtable.ts'
import { useToast } from '@/hooks/useToast.ts'
import {
  buildBaseTableInventory,
  inventorySummary,
  type BaseTableInventoryRow,
} from '@/lib/modules/baseTableInventory.ts'
import {
  isReservedModuleId,
  moduleFolderExists,
  moduleIdFromTable,
  scaffoldModuleFiles,
} from '@/lib/modules/scaffoldModuleFromTable.ts'
import { writeScaffoldedModuleFiles } from '@/lib/modules/writeScaffoldedModule.ts'
import { findTableInSchema } from '@/hooks/useBaseSchema.ts'

export default function DeveloperBaseTables() {
  const toast = useToast()
  const { baseId, isReady } = useAirtable()
  const schemaQuery = useBaseSchema()
  const [filter, setFilter] = useState('')
  const [scaffoldingId, setScaffoldingId] = useState<string | null>(null)

  const schemaTables = schemaQuery.data?.tables
  const rows = useMemo(() => {
    if (!schemaTables) return []
    return buildBaseTableInventory(schemaTables)
  }, [schemaTables])

  const summary = useMemo(() => inventorySummary(rows), [rows])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (row) =>
        row.tableName.toLowerCase().includes(q) ||
        row.tableId.toLowerCase().includes(q) ||
        row.suggestedModuleId.toLowerCase().includes(q) ||
        row.coveredBy?.moduleId.toLowerCase().includes(q),
    )
  }, [rows, filter])

  const exportJson = () => {
    if (!schemaQuery.data) return
    const blob = new Blob([JSON.stringify(schemaQuery.data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `base-schema-${baseId ?? 'unknown'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded base schema JSON')
  }

  const copyTableIds = async () => {
    const text = rows.map((row) => `${row.tableName}\t${row.tableId}`).join('\n')
    await navigator.clipboard.writeText(text)
    toast.success('Copied table names and ids')
  }

  const scaffoldRow = async (row: BaseTableInventoryRow) => {
    const meta = findTableInSchema(schemaQuery.data, row.tableId)
    if (!meta) {
      toast.error('Table not found in cached schema')
      return
    }

    const moduleId = moduleIdFromTable(meta)
    if (isReservedModuleId(moduleId)) {
      toast.warning(`"${moduleId}" is reserved for a built-in module.`)
      return
    }
    if (moduleFolderExists(moduleId)) {
      toast.warning(
        `Module folder "${moduleId}" already exists. Pick another id or remove the folder first.`,
      )
      return
    }

    setScaffoldingId(row.tableId)
    try {
      const files = scaffoldModuleFiles({ meta, moduleId })
      const result = await writeScaffoldedModuleFiles(moduleId, files)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(
        `Scaffolded module "${moduleId}" (${result.written.length} files). Enable it in Developer → Modules and reload.`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scaffold failed')
    } finally {
      setScaffoldingId(null)
    }
  }

  const columns: DataTableColumn<BaseTableInventoryRow>[] = [
    {
      id: 'tableName',
      label: 'Table',
      primary: true,
      render: (row) => <DataTableText>{row.tableName}</DataTableText>,
    },
    {
      id: 'tableId',
      label: 'Table ID',
      render: (row) => (
        <DataTableText mono secondary>
          {row.tableId}
        </DataTableText>
      ),
    },
    {
      id: 'fields',
      label: 'Fields',
      render: (row) => <DataTableText secondary>{row.fieldCount}</DataTableText>,
    },
    {
      id: 'primary',
      label: 'Primary',
      render: (row) => (
        <DataTableText secondary>
          {row.primaryFieldName} ({row.primaryFieldKey})
        </DataTableText>
      ),
    },
    {
      id: 'module',
      label: 'Module',
      render: (row) =>
        row.coveredBy ? (
          <Chip
            size="small"
            label={`${row.coveredBy.moduleId} · ${row.coveredBy.tableKey}`}
            color="success"
            variant="outlined"
          />
        ) : (
          <Chip
            size="small"
            label={`→ ${row.suggestedModuleId}`}
            variant="outlined"
          />
        ),
    },
    {
      id: 'actions',
      label: '',
      width: 120,
      render: (row) =>
        row.coveredBy ? (
          <DataTableText secondary>—</DataTableText>
        ) : (
          <Button
            size="small"
            variant="outlined"
            disabled={scaffoldingId != null}
            onClick={(event) => {
              event.stopPropagation()
              void scaffoldRow(row)
            }}
          >
            {scaffoldingId === row.tableId ? '…' : 'Scaffold'}
          </Button>
        ),
    },
  ]

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {getScreenTitle('devBaseTables')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Full inventory of the connected Airtable base ({baseId ?? 'not connected'}). Use
        one module per table: scaffold generates <code>module-repos/&lt;id&gt;/</code>{' '}
        with tables.ts from the Meta API, a read-only list screen, and menu entry.
      </Typography>

      {!isReady ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Connect your Shared base (menu → Airtable connection) with{' '}
          <code>schema.bases:read</code> on the token.
        </Alert>
      ) : null}

      {schemaQuery.isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {schemaQuery.error instanceof Error
            ? schemaQuery.error.message
            : 'Failed to load base schema'}
        </Alert>
      ) : null}

      {rows.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip label={`${summary.total} tables`} size="small" />
          <Chip label={`${summary.covered} in modules`} size="small" color="success" />
          <Chip label={`${summary.uncovered} to scaffold`} size="small" />
        </Stack>
      ) : null}

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => void schemaQuery.refetch()}
          disabled={schemaQuery.isFetching}
        >
          Refresh schema
        </Button>
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={exportJson}
          disabled={!schemaQuery.data}
        >
          Export JSON
        </Button>
        <Button
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={() => void copyTableIds()}
          disabled={rows.length === 0}
        >
          Copy ids
        </Button>
      </Stack>

      <TextField
        size="small"
        label="Filter tables"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      {schemaQuery.isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading base schema from Airtable…
        </Typography>
      ) : (
        <DataTable
          rows={filtered}
          columns={columns}
          getRowId={(row) => row.tableId}
          emptyTitle="No tables match"
          emptyDescription="Clear the filter or connect to Airtable."
        />
      )}
    </Box>
  )
}
