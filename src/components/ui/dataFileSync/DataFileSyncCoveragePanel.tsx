import { useMemo, useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { DataTable, DataTableText } from '@/components/ui/index.ts'
import type { DataTableColumn } from '@/components/ui/index.ts'
import {
  dataFileSyncCoverageSummary,
  type DataFileSyncCoverageRow,
  type DataFileSyncCoverageStatus,
} from '@/lib/dataFileSync/buildDataFileSyncCoverage.ts'
import type { DataFileMapping } from '@/lib/dataFileSync/types.ts'

const STATUS_META: Record<
  DataFileSyncCoverageStatus,
  { label: string; color: 'success' | 'info' | 'warning' | 'default' | 'error' }
> = {
  synced: { label: 'Synced', color: 'success' },
  upsertKey: { label: 'Upsert key', color: 'info' },
  matchOnly: { label: 'Match only', color: 'warning' },
  lookupDerived: { label: 'Via lookup', color: 'info' },
  csvUnmapped: { label: 'CSV not mapped', color: 'error' },
  airtableNoSource: { label: 'No CSV source', color: 'default' },
  notWritable: { label: 'Not writable', color: 'default' },
}

function statusChip(status: DataFileSyncCoverageStatus) {
  const meta = STATUS_META[status]
  return (
    <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
  )
}

function coverageColumns(): DataTableColumn<DataFileSyncCoverageRow>[] {
  return [
    {
      id: 'syncStatus',
      label: 'Sync',
      width: 130,
      render: (row) => statusChip(row.syncStatus),
    },
    {
      id: 'csvColumn',
      label: 'CSV column',
      primary: true,
      render: (row) => (
        <DataTableText mono={row.csvColumn !== '—'}>{row.csvColumn}</DataTableText>
      ),
    },
    {
      id: 'airtable',
      label: 'Airtable field',
      render: (row) => (
        <DataTableText>
          {row.airtableLabel}
          {row.airtableLabel !== row.airtableField ? (
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', fontFamily: 'monospace' }}
            >
              {row.airtableField}
            </Typography>
          ) : null}
        </DataTableText>
      ),
    },
    {
      id: 'airtableType',
      label: 'Airtable type',
      width: 120,
      render: (row) => <DataTableText secondary>{row.airtableType}</DataTableText>,
    },
    {
      id: 'detail',
      label: 'Notes',
      render: (row) => <DataTableText secondary>{row.detail}</DataTableText>,
    },
  ]
}

export interface DataFileSyncCoveragePanelProps {
  mapping: DataFileMapping
  coverage: readonly DataFileSyncCoverageRow[]
  defaultExpanded?: boolean
  /** Extra caption under the title (e.g. file path, geo notes). */
  helperText?: ReactNode
  sourcePath?: string
}

/**
 * Field mapping coverage: CSV columns ↔ Airtable schema ↔ sync behavior.
 */
export function DataFileSyncCoveragePanel({
  mapping,
  coverage,
  defaultExpanded = true,
  helperText,
  sourcePath,
}: DataFileSyncCoveragePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const summary = useMemo(() => dataFileSyncCoverageSummary(coverage), [coverage])

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.default',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Field mapping & sync coverage
          </Typography>
          <Chip
            size="small"
            label={`${summary.synced} synced`}
            color="success"
            sx={{ height: 20, fontSize: '0.6875rem' }}
          />
          {summary.csvUnmapped > 0 ? (
            <Chip
              size="small"
              label={`${summary.csvUnmapped} CSV unmapped`}
              color="error"
              sx={{ height: 20, fontSize: '0.6875rem' }}
            />
          ) : null}
          {summary.airtableNoSource > 0 ? (
            <Chip
              size="small"
              label={`${summary.airtableNoSource} Airtable only`}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.6875rem' }}
            />
          ) : null}
        </Stack>
        <IconButton
          size="small"
          aria-label={expanded ? 'Collapse mapping' : 'Expand mapping'}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ p: 1.5, pt: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Upsert: {mapping.upsertKey.csvColumn} → {mapping.upsertKey.airtableField}. Required
            CSV: {mapping.required.join(', ')}.
            {sourcePath ? (
              <>
                {' '}
                Defined in <code>{sourcePath}</code>.
              </>
            ) : null}
          </Typography>
          {helperText ? (
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{ mb: 1.5 }}
            >
              {helperText}
            </Typography>
          ) : null}
          <DataTable<DataFileSyncCoverageRow>
            rows={coverage}
            columns={coverageColumns()}
            getRowId={(row) => `${row.csvColumn}:${row.airtableField}`}
            emptyTitle="No coverage data"
          />
        </Box>
      </Collapse>
    </Box>
  )
}
