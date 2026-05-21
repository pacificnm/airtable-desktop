import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import { useDebug } from '../../context/DebugContext.tsx'
import { clearAirtableDataCache } from '../../lib/airtable/cache/airtableDataCache.ts'
import { formatFrameLocation } from '../../lib/debug/errorLocation.ts'
import { formatErrorEntryForCopy } from '../../lib/debug/errorDebugUtils.ts'
import {
  filterNetworkEntries,
  formatHttpPartForCopy,
  formatNetworkEntryForCopy,
  type NetworkStatusFilter,
} from '../../lib/debug/networkDebugUtils.ts'
import { formatRateLimitSummary } from '../../lib/debug/rateLimitHeaders.ts'
import { CopyDebugButton } from './CopyDebugButton.tsx'
import { DebugCacheTab } from './DebugCacheTab.tsx'
import type {
  DebugErrorEntry,
  DebugHttpPart,
  DebugNetworkEntry,
  DebugPerfEntry,
  DebugStackFrame,
} from '../../lib/debug/types.ts'

const preSx = {
  m: 0,
  p: 1,
  fontSize: '0.65rem',
  fontFamily: 'monospace',
  bgcolor: 'grey.100',
  overflow: 'auto',
  maxHeight: 200,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
} as const

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function statusColor(entry: DebugNetworkEntry): 'success' | 'error' | 'warning' | 'default' {
  if (entry.error || entry.status == null) return 'error'
  if (entry.status >= 400) return 'error'
  if (entry.status >= 300) return 'warning'
  return 'success'
}

function HttpPartBlock({ title, part }: { title: string; part: DebugHttpPart }) {
  const headerLines = Object.entries(part.headers)
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }}>
          {title}
        </Typography>
        <CopyDebugButton
          label="Copy"
          getText={() => formatHttpPartForCopy(title.toLowerCase(), part)}
        />
      </Box>
      {headerLines.length > 0 ? (
        <Box component="pre" sx={{ ...preSx, maxHeight: 100, mb: part.body ? 0.5 : 0 }}>
          {headerLines.map(([k, v]) => `${k}: ${v}`).join('\n')}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          No headers
        </Typography>
      )}
      {part.body ? (
        <Box component="pre" sx={preSx}>
          {part.body}
          {part.bodyTruncated ? '\n\n(truncated)' : ''}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          No body
        </Typography>
      )}
    </Box>
  )
}

function NetworkRow({ entry }: { entry: DebugNetworkEntry }) {
  const hasDetails = Boolean(entry.request || entry.response)

  const summary = (
    <Box sx={{ width: '100%', pr: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Chip label={entry.method} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
        {entry.status != null ? (
          <Chip
            label={String(entry.status)}
            size="small"
            color={statusColor(entry)}
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
        ) : null}
        {entry.attempt != null && entry.attempt > 0 ? (
          <Chip
            label={`retry #${entry.attempt}`}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.6rem' }}
          />
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {entry.durationMs} ms · {formatTime(entry.timestamp)}
        </Typography>
      </Box>
      {entry.requestId ? (
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.6rem',
            color: 'text.secondary',
            display: 'block',
          }}
        >
          {entry.requestId}
        </Typography>
      ) : null}
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          display: 'block',
          textAlign: 'left',
        }}
      >
        {entry.url}
      </Typography>
      {entry.rateLimit ? (
        <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mt: 0.25 }}>
          {formatRateLimitSummary(entry.rateLimit)}
        </Typography>
      ) : null}
      {entry.error ? (
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
          {entry.error}
        </Typography>
      ) : null}
    </Box>
  )

  if (!hasDetails) {
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>{summary}</Box>
          <CopyDebugButton
            label="Copy"
            getText={() => formatNetworkEntryForCopy(entry)}
          />
        </Box>
      </Box>
    )
  }

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
        {summary}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <CopyDebugButton
            label="Copy all"
            getText={() => formatNetworkEntryForCopy(entry)}
          />
        </Box>
        {entry.request ? <HttpPartBlock title="Request" part={entry.request} /> : null}
        {entry.response ? <HttpPartBlock title="Response" part={entry.response} /> : null}
      </AccordionDetails>
    </Accordion>
  )
}

function NetworkToolbar({
  urlFilter,
  onUrlFilterChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
}: {
  urlFilter: string
  onUrlFilterChange: (v: string) => void
  statusFilter: NetworkStatusFilter
  onStatusFilterChange: (v: NetworkStatusFilter) => void
  totalCount: number
  filteredCount: number
}) {
  const filtering = urlFilter.trim() !== '' || statusFilter !== 'all'
  return (
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
        <TextField
          size="small"
          placeholder="Filter URL…"
          value={urlFilter}
          onChange={(e) => onUrlFilterChange(e.target.value)}
          sx={{ flex: 1, minWidth: 140 }}
        />
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="debug-network-status-filter">Status</InputLabel>
          <Select
            labelId="debug-network-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as NetworkStatusFilter)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="2xx">2xx</MenuItem>
            <MenuItem value="3xx">3xx</MenuItem>
            <MenuItem value="4xx">4xx</MenuItem>
            <MenuItem value="5xx">5xx</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {filtering ? (
        <Typography variant="caption" color="text.secondary">
          Showing {filteredCount} of {totalCount}
        </Typography>
      ) : null}
    </Box>
  )
}

function NetworkList({
  items,
  allItems,
  urlFilter,
  onUrlFilterChange,
  statusFilter,
  onStatusFilterChange,
}: {
  items: readonly DebugNetworkEntry[]
  allItems: readonly DebugNetworkEntry[]
  urlFilter: string
  onUrlFilterChange: (v: string) => void
  statusFilter: NetworkStatusFilter
  onStatusFilterChange: (v: NetworkStatusFilter) => void
}) {
  if (allItems.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No requests captured yet.
      </Typography>
    )
  }
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <NetworkToolbar
        urlFilter={urlFilter}
        onUrlFilterChange={onUrlFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        totalCount={allItems.length}
        filteredCount={items.length}
      />
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No requests match this filter.
        </Typography>
      ) : (
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {items.map((n) => (
            <NetworkRow key={n.id} entry={n} />
          ))}
        </Box>
      )}
    </Box>
  )
}

function StackFrames({ frames }: { frames: readonly DebugStackFrame[] }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2, listStyle: 'none' }}>
      {frames.map((frame, i) => (
        <Box
          component="li"
          key={`${frame.file}-${frame.line}-${i}`}
          sx={{
            py: 0.35,
            opacity: frame.internal ? 0.55 : 1,
          }}
        >
          <Typography
            variant="caption"
            component="span"
            sx={{
              fontFamily: 'monospace',
              fontWeight: frame.internal ? 400 : 600,
              color: frame.internal ? 'text.secondary' : 'text.primary',
            }}
          >
            {formatFrameLocation(frame)}
          </Typography>
          {frame.name ? (
            <Typography variant="caption" color="text.secondary" component="span">
              {' '}
              · {frame.name}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}

function ErrorSummaryContent({ entry }: { entry: DebugErrorEntry }) {
  return (
    <Box sx={{ width: '100%', pr: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
        {entry.message}
      </Typography>
      {entry.location ? (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            fontFamily: 'monospace',
            color: 'primary.main',
            wordBreak: 'break-all',
          }}
        >
          {entry.location}
        </Typography>
      ) : null}
      {entry.detail ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.25, fontFamily: 'monospace', wordBreak: 'break-all' }}
        >
          {entry.detail}
        </Typography>
      ) : null}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
        {entry.source ? (
          <Chip label={entry.source} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
        ) : null}
        <Typography variant="caption" color="text.secondary">
          {formatTime(entry.timestamp)}
        </Typography>
      </Box>
    </Box>
  )
}

function ErrorCopyButton({ entry }: { entry: DebugErrorEntry }) {
  return (
    <CopyDebugButton label="Copy" getText={() => formatErrorEntryForCopy(entry)} />
  )
}

function ErrorRow({ entry }: { entry: DebugErrorEntry }) {
  const frames = entry.frames ?? []
  const hasStack = Boolean(entry.stack || frames.length > 0)

  if (!hasStack) {
    return (
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ErrorSummaryContent entry={entry} />
        </Box>
        <ErrorCopyButton entry={entry} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          flex: 1,
          minWidth: 0,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon fontSize="small" />}
          sx={{ px: 2, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
        >
          <ErrorSummaryContent entry={entry} />
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pt: 0, pb: 1.5, bgcolor: 'grey.50' }}>
          {frames.length > 0 ? <StackFrames frames={frames} /> : null}
          {entry.stack ? (
            <Box
              component="pre"
              sx={{
                ...preSx,
                mt: frames.length > 0 ? 1 : 0,
                maxHeight: 160,
              }}
            >
              {entry.stack}
            </Box>
          ) : null}
        </AccordionDetails>
      </Accordion>
      <Box sx={{ flexShrink: 0, pt: 1.25, pr: 1 }}>
        <ErrorCopyButton entry={entry} />
      </Box>
    </Box>
  )
}

function ErrorList({ items }: { items: readonly DebugErrorEntry[] }) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No errors captured.
      </Typography>
    )
  }
  return (
    <Box sx={{ overflow: 'auto', flex: 1 }}>
      {items.map((e) => (
        <ErrorRow key={e.id} entry={e} />
      ))}
    </Box>
  )
}

function PerfList({ items }: { items: readonly DebugPerfEntry[] }) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No performance data yet.
      </Typography>
    )
  }
  return (
    <Box sx={{ overflow: 'auto', flex: 1 }}>
      {items.map((p) => (
        <Box
          key={p.id}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2">{p.label}</Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {p.value}
            </Typography>
            {p.detail ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {p.detail}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export function DebugPanel() {
  const {
    open,
    setOpen,
    snapshot,
    clearNetwork,
    clearErrors,
    refreshPerf,
    clearOnNavigate,
    setClearOnNavigate,
  } = useDebug()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState(0)
  const [urlFilter, setUrlFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<NetworkStatusFilter>('all')
  const [cacheRevision, setCacheRevision] = useState(0)
  const bumpCacheRevision = () => setCacheRevision((n) => n + 1)

  const filteredNetwork = useMemo(
    () => filterNetworkEntries(snapshot.network, urlFilter, statusFilter),
    [snapshot.network, urlFilter, statusFilter],
  )

  const networkTabLabel = useMemo(() => {
    const total = snapshot.network.length
    const shown = filteredNetwork.length
    const filtering = urlFilter.trim() !== '' || statusFilter !== 'all'
    if (!filtering || shown === total) return `Network (${total})`
    return `Network (${shown}/${total})`
  }, [snapshot.network.length, filteredNetwork.length, urlFilter, statusFilter])

  const handleClear = () => {
    if (tab === 0) clearNetwork()
    else if (tab === 1) clearErrors()
    else if (tab === 2) refreshPerf()
    else {
      clearAirtableDataCache()
      queryClient.clear()
      bumpCacheRevision()
    }
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{
        paper: {
          sx: {
            height: { xs: '85vh', sm: '80vh' },
            maxHeight: '95vh',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          Debug
        </Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={clearOnNavigate}
              onChange={(_, checked) => setClearOnNavigate(checked)}
            />
          }
          label={
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
              Clear on navigate
            </Typography>
          }
          sx={{ mr: 0 }}
        />
        <Button size="small" onClick={handleClear}>
          Clear
        </Button>
        {tab === 2 ? (
          <Button size="small" onClick={refreshPerf}>
            Refresh
          </Button>
        ) : null}
        {tab === 3 ? (
          <Button size="small" onClick={bumpCacheRevision}>
            Refresh
          </Button>
        ) : null}
        <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close debug panel">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ flexShrink: 0, minHeight: 40 }}
      >
        <Tab label={networkTabLabel} sx={{ minHeight: 40, fontSize: '0.75rem' }} />
        <Tab
          label={`Errors (${snapshot.errorCount})`}
          sx={{ minHeight: 40, fontSize: '0.75rem' }}
        />
        <Tab label="Performance" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
        <Tab label="Cache" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {tab === 0 ? (
          <NetworkList
            items={filteredNetwork}
            allItems={snapshot.network}
            urlFilter={urlFilter}
            onUrlFilterChange={setUrlFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        ) : null}
        {tab === 1 ? <ErrorList items={snapshot.errors} /> : null}
        {tab === 2 ? <PerfList items={snapshot.perf} /> : null}
        {tab === 3 ? (
          <DebugCacheTab revision={cacheRevision} onRevisionChange={bumpCacheRevision} />
        ) : null}
      </Box>
    </Drawer>
  )
}
