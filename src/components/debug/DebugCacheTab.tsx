import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useQueryClient } from '@tanstack/react-query'
import { useAirtable } from '../../hooks/useAirtable.ts'
import {
  clearAirtableDataCache,
  deleteAirtableDataCacheEntry,
  getAirtableDataCache,
  listLoadedAirtableDataCacheBaseIds,
  type CacheEntryKind,
  type CacheEntrySnapshot,
} from '../../lib/airtable/cache/airtableDataCache.ts'
import { CACHE_TTL_MS } from '../../lib/airtable/cache/cacheTtl.ts'
import {
  formatBytes,
  formatCacheJson,
  formatExpiresIn,
  getReactQueryCacheData,
  kindLabel,
  snapshotReactQueryCache,
  type ReactQueryCacheRow,
} from '../../lib/debug/cacheDebugUtils.ts'
import { CopyDebugButton } from './CopyDebugButton.tsx'

type AirtableKindFilter = CacheEntryKind | 'all'

const cachePreSx = {
  m: 0,
  p: 1,
  fontSize: '0.65rem',
  fontFamily: 'monospace',
  bgcolor: 'grey.100',
  overflow: 'auto',
  maxHeight: 'min(50vh, 420px)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
} as const

function formatExpiryTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function kindColor(
  kind: CacheEntryKind,
): 'default' | 'primary' | 'secondary' | 'info' | 'warning' {
  switch (kind) {
    case 'schema':
      return 'primary'
    case 'list':
      return 'info'
    case 'record':
      return 'secondary'
    case 'linkedLabels':
      return 'warning'
    default:
      return 'default'
  }
}

function CacheJsonView({ data }: { data: unknown }) {
  const { text, truncated, totalChars } = formatCacheJson(data)
  return (
    <>
      {truncated ? (
        <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mb: 0.5 }}>
          Showing first {formatBytes(text.length)} of {formatBytes(totalChars)} — copy for full JSON
        </Typography>
      ) : null}
      <Box component="pre" sx={cachePreSx}>
        {text}
      </Box>
    </>
  )
}

function AirtableEntrySummary({ entry }: { entry: CacheEntrySnapshot }) {
  return (
    <Box sx={{ width: '100%', pr: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
        <Chip
          label={kindLabel(entry.kind)}
          size="small"
          color={kindColor(entry.kind)}
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
        {entry.isExpired ? (
          <Chip label="expired" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />
        ) : (
          <Chip
            label={formatExpiresIn(entry.expiresInMs)}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {formatBytes(entry.sizeBytes)} · {entry.summary}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ fontFamily: 'monospace', wordBreak: 'break-all', display: 'block' }}
      >
        {entry.key}
      </Typography>
      {entry.tableId ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          table {entry.tableId}
        </Typography>
      ) : null}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
        expires {formatExpiryTime(entry.expiresAt)}
      </Typography>
    </Box>
  )
}

function AirtableCacheRow({
  baseId,
  entry,
  onDeleted,
}: {
  baseId: string
  entry: CacheEntrySnapshot
  onDeleted: () => void
}) {
  const raw = getAirtableDataCache(baseId).peekEntryRaw(entry.key)

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{ px: 2, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
      >
        <AirtableEntrySummary entry={entry} />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 0.5 }}>
          {raw ? (
            <CopyDebugButton
              label="Copy JSON"
              getText={() => formatCacheJson(raw.data, Number.MAX_SAFE_INTEGER).text}
            />
          ) : null}
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              deleteAirtableDataCacheEntry(baseId, entry.key)
              onDeleted()
            }}
            sx={{ minWidth: 0, fontSize: '0.65rem' }}
          >
            Remove
          </Button>
        </Box>
        {raw ? (
          <CacheJsonView data={raw.data} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            No cached payload in memory.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

function ReactQueryEntrySummary({ row }: { row: ReactQueryCacheRow }) {
  return (
    <Box sx={{ width: '100%', pr: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
        <Chip label={row.status} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
        {row.isStale ? (
          <Chip label="stale" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
        ) : null}
        <Typography variant="caption" color="text.secondary">
          {row.summary}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ fontFamily: 'monospace', wordBreak: 'break-all', display: 'block' }}
      >
        {row.queryKey}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
        updated {formatExpiryTime(row.dataUpdatedAt)}
      </Typography>
    </Box>
  )
}

function ReactQueryRow({
  row,
  queryClient,
  onDeleted,
}: {
  row: ReactQueryCacheRow
  queryClient: ReturnType<typeof useQueryClient>
  onDeleted: () => void
}) {
  const payload = getReactQueryCacheData(queryClient, row.queryHash)

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{ px: 2, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
      >
        <ReactQueryEntrySummary row={row} />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 0.5 }}>
          {payload !== undefined ? (
            <CopyDebugButton
              label="Copy JSON"
              getText={() => formatCacheJson(payload, Number.MAX_SAFE_INTEGER).text}
            />
          ) : null}
          <Button
            size="small"
            color="inherit"
            onClick={() => onDeleted()}
            sx={{ minWidth: 0, fontSize: '0.65rem' }}
          >
            Remove
          </Button>
        </Box>
        {payload !== undefined ? (
          <CacheJsonView data={payload} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            Query no longer in cache.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export interface DebugCacheTabProps {
  revision: number
  onRevisionChange: () => void
}

export function DebugCacheTab({ revision, onRevisionChange }: DebugCacheTabProps) {
  const { baseId } = useAirtable()
  const queryClient = useQueryClient()
  const [keyFilter, setKeyFilter] = useState('')
  const [kindFilter, setKindFilter] = useState<AirtableKindFilter>('all')
  const [section, setSection] = useState<'airtable' | 'react-query'>('airtable')

  const bump = onRevisionChange

  const airtableEntries = useMemo(() => {
    void revision
    const ids = baseId
      ? [baseId, ...listLoadedAirtableDataCacheBaseIds().filter((id) => id !== baseId)]
      : listLoadedAirtableDataCacheBaseIds()
    const unique = [...new Set(ids)]
    return unique.flatMap((id) => {
      const cache = getAirtableDataCache(id)
      return cache.listEntrySnapshots().map((entry) => ({ baseId: id, entry }))
    })
  }, [baseId, revision])

  const filteredAirtable = useMemo(() => {
    const q = keyFilter.trim().toLowerCase()
    return airtableEntries.filter(({ entry }) => {
      if (kindFilter !== 'all' && entry.kind !== kindFilter) return false
      if (!q) return true
      return (
        entry.key.toLowerCase().includes(q) ||
        entry.tableId?.toLowerCase().includes(q) ||
        entry.summary.toLowerCase().includes(q)
      )
    })
  }, [airtableEntries, keyFilter, kindFilter])

  const reactQueryRows = useMemo(() => {
    void revision
    return snapshotReactQueryCache(queryClient)
  }, [queryClient, revision])

  const filteredReactQuery = useMemo(() => {
    const q = keyFilter.trim().toLowerCase()
    if (!q) return reactQueryRows
    return reactQueryRows.filter(
      (row) =>
        row.queryKey.toLowerCase().includes(q) ||
        row.queryHash.toLowerCase().includes(q),
    )
  }, [reactQueryRows, keyFilter])

  const clearAllAirtable = useCallback(() => {
    clearAirtableDataCache()
    bump()
  }, [bump])

  const clearAirtableForBase = useCallback(() => {
    if (baseId) clearAirtableDataCache(baseId)
    else clearAirtableDataCache()
    bump()
  }, [baseId, bump])

  const clearAllReactQuery = useCallback(() => {
    queryClient.clear()
    bump()
  }, [queryClient, bump])

  const removeReactQuery = useCallback(
    (queryHash: string) => {
      const query = queryClient
        .getQueryCache()
        .getAll()
        .find((q) => q.queryHash === queryHash)
      if (query) queryClient.removeQueries({ queryKey: query.queryKey })
      bump()
    },
    [queryClient, bump],
  )

  const activeCount =
    section === 'airtable' ? filteredAirtable.length : filteredReactQuery.length
  const totalCount = section === 'airtable' ? airtableEntries.length : reactQueryRows.length

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant={section === 'airtable' ? 'contained' : 'outlined'}
            onClick={() => setSection('airtable')}
          >
            Airtable ({airtableEntries.length})
          </Button>
          <Button
            size="small"
            variant={section === 'react-query' ? 'contained' : 'outlined'}
            onClick={() => setSection('react-query')}
          >
            React Query ({reactQueryRows.length})
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Filter keys…"
            value={keyFilter}
            onChange={(e) => setKeyFilter(e.target.value)}
            sx={{ flex: 1, minWidth: 140 }}
          />
          {section === 'airtable' ? (
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel id="debug-cache-kind">Kind</InputLabel>
              <Select
                labelId="debug-cache-kind"
                label="Kind"
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as AirtableKindFilter)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="schema">Schema</MenuItem>
                <MenuItem value="list">List</MenuItem>
                <MenuItem value="record">Record</MenuItem>
                <MenuItem value="linkedLabels">Labels</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {section === 'airtable' ? (
            <>
              <Button size="small" color="warning" onClick={clearAirtableForBase}>
                {baseId ? 'Clear base cache' : 'Clear all bases'}
              </Button>
              <Button size="small" color="warning" onClick={clearAllAirtable}>
                Clear every base
              </Button>
            </>
          ) : (
            <Button size="small" color="warning" onClick={clearAllReactQuery}>
              Clear React Query
            </Button>
          )}
          <Button size="small" onClick={bump}>
            Refresh
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {section === 'airtable' ? (
            <>
              TTL: schema {formatExpiresIn(CACHE_TTL_MS.schema)}, list{' '}
              {formatExpiresIn(CACHE_TTL_MS.list)}, record{' '}
              {formatExpiresIn(CACHE_TTL_MS.record)}, labels{' '}
              {formatExpiresIn(CACHE_TTL_MS.linkedLabels)}
              {baseId ? ` · active base ${baseId}` : ''}
              {' · expand a row to view JSON'}
            </>
          ) : (
            <>
              TanStack Query in-memory cache. Expand a row to view status, error, and data.
            </>
          )}
        </Typography>
        {keyFilter.trim() || kindFilter !== 'all' ? (
          <Typography variant="caption" color="text.secondary">
            Showing {activeCount} of {totalCount}
          </Typography>
        ) : null}
      </Box>

      {section === 'airtable' ? (
        filteredAirtable.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {airtableEntries.length === 0
              ? 'No Airtable data cached yet. Browse tables while connected to populate the cache.'
              : 'No entries match this filter.'}
          </Typography>
        ) : (
          <Box sx={{ overflow: 'auto', flex: 1 }}>
            {filteredAirtable.map(({ baseId: bid, entry }) => (
              <Box key={`${bid}:${entry.key}`}>
                {listLoadedAirtableDataCacheBaseIds().length > 1 ? (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      px: 2,
                      pt: 1,
                      pb: 0.25,
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                    }}
                  >
                    {bid}
                  </Typography>
                ) : null}
                <AirtableCacheRow baseId={bid} entry={entry} onDeleted={bump} />
              </Box>
            ))}
          </Box>
        )
      ) : filteredReactQuery.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          {reactQueryRows.length === 0
            ? 'No React Query entries.'
            : 'No queries match this filter.'}
        </Typography>
      ) : (
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {filteredReactQuery.map((row) => (
            <ReactQueryRow
              key={row.queryHash}
              row={row}
              queryClient={queryClient}
              onDeleted={() => removeReactQuery(row.queryHash)}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
