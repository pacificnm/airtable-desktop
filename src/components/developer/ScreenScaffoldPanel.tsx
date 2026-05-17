import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Chip from '@mui/material/Chip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  bundleToClipboardText,
  generateScreenScaffold,
  isReservedViewId,
  screenScaffoldFromTableName,
  type ScreenScaffoldInput,
} from '../../lib/developer/screenScaffold.ts'

const preSx = {
  m: 0,
  p: 1.5,
  bgcolor: 'grey.100',
  borderRadius: 1,
  overflow: 'auto',
  fontSize: '0.65rem',
  maxHeight: 280,
} as const

const accordionSx = {
  '&:before': { display: 'none' },
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
  mb: 1,
  '&:last-of-type': { mb: 0 },
} as const

export interface ScreenScaffoldPanelProps {
  /** Prefill from Airtable table name (Developer → Tables). */
  tableName?: string
  compact?: boolean
}

function ScreenScaffoldForm({
  tableName,
  compact = false,
}: ScreenScaffoldPanelProps) {
  const derived = tableName ? screenScaffoldFromTableName(tableName) : null
  const [configKey, setConfigKey] = useState(derived?.viewId ?? '')
  const [screenTitle, setScreenTitle] = useState(tableName ?? '')
  const [menuLabel, setMenuLabel] = useState(tableName ?? '')
  const [menuSectionLabel, setMenuSectionLabel] = useState('App')
  const [useListQuery, setUseListQuery] = useState(true)
  const [screenTemplate, setScreenTemplate] = useState<'list' | 'inline'>('list')
  const [copied, setCopied] = useState<string | null>(null)

  const bundle = useMemo(() => {
    const key = configKey.trim()
    if (!key) return null
    const input: ScreenScaffoldInput = {
      configKey: key,
      screenTitle: screenTitle.trim() || key,
      menuLabel: menuLabel.trim() || screenTitle.trim() || key,
      menuSectionLabel: menuSectionLabel.trim() || 'App',
      useListQuery,
      screenTemplate,
    }
    return generateScreenScaffold(input)
  }, [configKey, screenTitle, menuLabel, menuSectionLabel, useListQuery, screenTemplate])

  const reserved = configKey.trim() ? isReservedViewId(configKey.trim()) : false

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    window.setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Box>
      {!compact ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generates a list screen plus patches for <code>appView</code>,{' '}
          <code>screens.ts</code>, <code>menu.ts</code>, and <code>tables.ts</code>.
          Paste each snippet after your table hook exists, then reload the app.
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          mb: 2,
        }}
      >
        <TextField
          label="View / table key"
          size="small"
          value={configKey}
          onChange={(e) => setConfigKey(e.target.value)}
          helperText="AppView id & tables.ts key (camelCase)"
          error={reserved}
        />
        <TextField
          label="Screen title"
          size="small"
          value={screenTitle}
          onChange={(e) => setScreenTitle(e.target.value)}
        />
        <TextField
          label="Menu label"
          size="small"
          value={menuLabel}
          onChange={(e) => setMenuLabel(e.target.value)}
        />
        <TextField
          label="Menu section"
          size="small"
          value={menuSectionLabel}
          onChange={(e) => setMenuSectionLabel(e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Button
          size="small"
          variant={screenTemplate === 'list' ? 'contained' : 'outlined'}
          onClick={() => setScreenTemplate('list')}
        >
          Generic ListScreen
        </Button>
        <Button
          size="small"
          variant={screenTemplate === 'inline' ? 'contained' : 'outlined'}
          onClick={() => setScreenTemplate('inline')}
        >
          Inline screen
        </Button>
        {screenTemplate === 'inline' ? (
          <>
            <Button
              size="small"
              variant={useListQuery ? 'contained' : 'outlined'}
              onClick={() => setUseListQuery(true)}
            >
              TanStack list query
            </Button>
            <Button
              size="small"
              variant={!useListQuery ? 'contained' : 'outlined'}
              onClick={() => setUseListQuery(false)}
            >
              useEffect + list()
            </Button>
          </>
        ) : null}
        {bundle ? (
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => void copyText(bundleToClipboardText(bundle), 'all')}
          >
            {copied === 'all' ? 'Copied all' : 'Copy all snippets'}
          </Button>
        ) : null}
      </Box>

      {reserved ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <code>{configKey}</code> is reserved for the starter shell. Pick another view
          id.
        </Alert>
      ) : null}

      {!bundle ? (
        <Typography variant="body2" color="text.secondary">
          Enter a view key to generate snippets.
        </Typography>
      ) : (
        bundle.files.map((file) => (
          <Accordion
            key={file.path}
            disableGutters
            elevation={0}
            defaultExpanded={file.kind === 'create'}
            sx={accordionSx}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  width: '100%',
                  pr: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  {file.path}
                </Typography>
                <Chip
                  label={file.kind}
                  size="small"
                  color={file.kind === 'create' ? 'primary' : 'default'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={(e) => {
                    e.stopPropagation()
                    void copyText(file.content, file.path)
                  }}
                >
                  {copied === file.path ? 'Copied' : 'Copy'}
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {file.description}
              </Typography>
              <Box component="pre" sx={preSx}>
                {file.content}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  )
}

export function ScreenScaffoldPanel(props: ScreenScaffoldPanelProps) {
  return <ScreenScaffoldForm key={props.tableName ?? '__manual__'} {...props} />
}
