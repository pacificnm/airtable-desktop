import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { DataTable, DataTableText } from '@/components/ui/index.ts'
import type { DataTableColumn } from '@/components/ui/index.ts'
import type {
  DataFileFieldMapping,
  DataFileMapping,
} from '@/lib/dataFileSync/types.ts'

export interface DataFileMappingPanelProps {
  mapping: DataFileMapping
  /** Default expanded state (default: false). */
  defaultExpanded?: boolean
  /** Source file path/name to display in the helper text. */
  sourcePath?: string
}

type TypeMeta = {
  label: string
  color: 'default' | 'primary' | 'secondary' | 'info' | 'warning'
}

const TYPE_META: Record<DataFileFieldMapping['type'], TypeMeta> = {
  string: { label: 'string', color: 'default' },
  number: { label: 'number', color: 'info' },
  boolean: { label: 'boolean', color: 'info' },
  singleSelect: { label: 'select', color: 'secondary' },
  linkedRecord: { label: 'link', color: 'primary' },
}

function typeChip(type: DataFileFieldMapping['type']) {
  const meta = TYPE_META[type]
  return (
    <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
  )
}

function columns(): DataTableColumn<DataFileFieldMapping>[] {
  return [
    {
      id: 'csvColumn',
      label: 'CSV column',
      primary: true,
      render: (row) => <DataTableText mono>{row.csvColumn}</DataTableText>,
    },
    {
      id: 'airtableField',
      label: 'Airtable field',
      render: (row) => (
        <DataTableText>{row.airtableLabel ?? row.airtableField}</DataTableText>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      width: 110,
      render: (row) => typeChip(row.type),
    },
    {
      id: 'link',
      label: 'Lookup',
      render: (row) =>
        row.link ? (
          <DataTableText secondary>
            {row.link.tableKey}.{row.link.matchField}
          </DataTableText>
        ) : (
          <DataTableText secondary>—</DataTableText>
        ),
    },
    {
      id: 'note',
      label: 'Notes',
      render: (row) => (
        <DataTableText secondary>{row.note ?? '—'}</DataTableText>
      ),
    },
  ]
}

/**
 * Read-only display of a {@link DataFileMapping}. Collapsible so it doesn't
 * dominate the flyout; expand to verify which CSV columns map to which
 * Airtable fields before running a sync.
 */
export function DataFileMappingPanel({
  mapping,
  defaultExpanded = false,
  sourcePath,
}: DataFileMappingPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

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
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Field mapping
          </Typography>
          <Chip
            size="small"
            label={`${mapping.fields.length} fields`}
            sx={{ height: 20, fontSize: '0.6875rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            Upsert key: {mapping.upsertKey.csvColumn} → {mapping.upsertKey.airtableField}
          </Typography>
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
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            Read-only{sourcePath ? <> — defined in <code>{sourcePath}</code></> : null}.
            Required CSV columns: {mapping.required.join(', ')}.
          </Typography>
          <DataTable<DataFileFieldMapping>
            rows={mapping.fields}
            columns={columns()}
            getRowId={(row) => `${row.csvColumn}->${row.airtableField}`}
            emptyTitle="No fields mapped"
          />
        </Box>
      </Collapse>
    </Box>
  )
}
