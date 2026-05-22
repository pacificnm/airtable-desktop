import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DataTable, DataTableText, type DataTableColumn } from '../components/ui/index.ts'
import { DataFileMappingPanel } from '../components/ui/dataFileSync/DataFileMappingPanel.tsx'
import { DataFileSyncCoveragePanel } from '../components/ui/dataFileSync/DataFileSyncCoveragePanel.tsx'
import { getScreenTitle } from '../config/screens.ts'
import {
  dataFileMappingRegistry,
  getRegistryCoverage,
  validateRegistryEntry,
} from '../lib/dataFileSync/registry.ts'
import type { DataFileMappingRegistryEntry } from '../lib/dataFileSync/registryTypes.ts'
import type { DataFileMappingValidationIssue } from '../lib/dataFileSync/validateDataFileMapping.ts'

type RegistryRow = DataFileMappingRegistryEntry & {
  issueCount: number
}

const registryColumns: DataTableColumn<RegistryRow>[] = [
  {
    id: 'label',
    label: 'Mapping',
    primary: true,
    render: (row) => <DataTableText>{row.mapping.label}</DataTableText>,
  },
  {
    id: 'table',
    label: 'Table',
    render: (row) => (
      <DataTableText mono>
        {row.mapping.tableKey}
      </DataTableText>
    ),
  },
  {
    id: 'module',
    label: 'Module',
    width: 120,
    render: (row) => <DataTableText secondary>{row.moduleId}</DataTableText>,
  },
  {
    id: 'fields',
    label: 'Fields',
    width: 80,
    render: (row) => <DataTableText>{row.mapping.fields.length}</DataTableText>,
  },
  {
    id: 'validation',
    label: 'Validation',
    width: 110,
    render: (row) =>
      row.issueCount === 0 ? (
        <Chip size="small" label="OK" color="success" variant="outlined" />
      ) : (
        <Chip size="small" label={`${row.issueCount} issues`} color="error" variant="outlined" />
      ),
  },
]

export default function DeveloperDataFileMappings() {
  const [selectedId, setSelectedId] = useState<string | null>(
    dataFileMappingRegistry[0]?.mapping.id ?? null,
  )

  const registryRows = useMemo(
    (): RegistryRow[] =>
      dataFileMappingRegistry.map((entry) => ({
        ...entry,
        issueCount: validateRegistryEntry(entry).length,
      })),
    [],
  )

  const selected = useMemo(
    () => registryRows.find((r) => r.mapping.id === selectedId) ?? null,
    [registryRows, selectedId],
  )

  const issues: DataFileMappingValidationIssue[] = useMemo(
    () => (selected ? validateRegistryEntry(selected) : []),
    [selected],
  )

  const coverage = useMemo(
    () => (selected ? getRegistryCoverage(selected) : []),
    [selected],
  )

  const totalIssues = registryRows.reduce((n, r) => n + r.issueCount, 0)

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {getScreenTitle('devDataFileMappings')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        All data-file → Airtable field mappings live in TypeScript under{' '}
        <code>module-repos/*/lib/*DataFileMapping.ts</code>, registered in{' '}
        <code>src/lib/dataFileSync/registry.ts</code>. Edit code and reload — nothing is stored in
        Airtable.
      </Typography>

      {totalIssues > 0 ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {totalIssues} validation issue(s) across mappings. Fix before relying on sync in
          production.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 2 }}>
          All {dataFileMappingRegistry.length} mappings pass schema validation.
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <DataTable<RegistryRow>
          rows={registryRows}
          columns={registryColumns}
          getRowId={(row) => row.mapping.id}
          onRowClick={(row) => setSelectedId(row.mapping.id)}
          emptyTitle="No mappings registered"
        />
      </Box>

      {selected ? (
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selected.mapping.label}
            </Typography>
            {selected.description ? (
              <Typography variant="body2" color="text.secondary">
                {selected.description}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              <code>{selected.sourcePath}</code> · module <code>{selected.moduleId}</code> · table{' '}
              <code>{selected.mapping.tableKey}</code>
            </Typography>
          </Box>

          {issues.length > 0 ? (
            <Alert severity="error">
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
                {issues.map((issue) => (
                  <li key={`${issue.code}-${issue.message}`}>
                    <Typography variant="body2">
                      <strong>{issue.code}</strong>: {issue.message}
                    </Typography>
                  </li>
                ))}
              </Stack>
            </Alert>
          ) : null}

          <DataFileMappingPanel
            mapping={selected.mapping}
            defaultExpanded
            sourcePath={selected.sourcePath}
          />

          <DataFileSyncCoveragePanel
            mapping={selected.mapping}
            coverage={coverage}
            sourcePath={selected.sourcePath}
          />
        </Stack>
      ) : null}
    </Box>
  )
}
