import { useMemo, type ReactNode } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import type { MetaFieldSchema, MetaTableSchema } from '../../lib/airtable/metaTypes.ts'
import { generateTableConfigSnippet } from '../../lib/airtable/generateTableConfigSnippet.ts'
import { generateZodSchemaSnippet } from '../../lib/airtable/generateZodSchemaSnippet.ts'
import { generateCrudHookSnippet } from '../../lib/airtable/generateCrudHookSnippet.ts'
import { generateQueryHooksSnippet } from '../../lib/airtable/generateQueryHooksSnippet.ts'
import {
  configKeyFromTableName,
  hookNameFromConfigKey,
  pascalFromConfigKey,
} from '../../lib/airtable/tableCodegen.ts'
import {
  fieldTypeLabel,
  summarizeFieldOptions,
} from '../../lib/airtable/formatFieldMeta.ts'
import {
  inferFieldZod,
  type AirtableRequiredHint,
} from '../../lib/airtable/inferZodFromField.ts'
import { ScreenScaffoldPanel } from './ScreenScaffoldPanel.tsx'

export interface TableDetailFlyoutProps {
  open: boolean
  onClose: () => void
  table: MetaTableSchema | null
  loading?: boolean
  error?: string | null
}

const accordionSx = {
  '&:before': { display: 'none' },
  border: 1,
  borderColor: 'divider',
  borderRadius: 1,
  mb: 1,
  '&:last-of-type': { mb: 0 },
} as const

const preSx = {
  m: 0,
  p: 1.5,
  bgcolor: 'grey.100',
  borderRadius: 1,
  overflow: 'auto',
} as const

function DetailAccordion({
  title,
  subtitle,
  defaultExpanded = false,
  onCopy,
  children,
}: {
  title: string
  subtitle?: string
  defaultExpanded?: boolean
  onCopy?: () => void | Promise<void>
  children: ReactNode
}) {
  return (
    <Accordion disableGutters elevation={0} defaultExpanded={defaultExpanded} sx={accordionSx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            pr: 1,
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">{title}</Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {onCopy && (
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={(e) => {
                e.stopPropagation()
                void onCopy()
              }}
            >
              Copy
            </Button>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  )
}

function primaryFieldName(table: MetaTableSchema): string {
  return (
    table.fields.find((f) => f.id === table.primaryFieldId)?.name ?? '—'
  )
}

function requiredHintLabel(hint: AirtableRequiredHint): string {
  switch (hint) {
    case 'primary':
      return 'Primary (required on create)'
    case 'never':
      return 'Read-only'
    default:
      return 'Unknown — set in validation'
  }
}

function FieldRow({
  field,
  isPrimary,
  primaryFieldId,
}: {
  field: MetaFieldSchema
  isPrimary: boolean
  primaryFieldId: string
}) {
  const optionsSummary = summarizeFieldOptions(field)
  const hasOptionsJson =
    field.options && Object.keys(field.options).length > 0
  const zod = inferFieldZod(field, { primaryFieldId })

  return (
    <TableRow selected={isPrimary}>
      <TableCell>
        {field.name}
        {isPrimary && (
          <Chip label="primary" size="small" sx={{ ml: 0.5 }} color="primary" />
        )}
        {field.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.25 }}
          >
            {field.description}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="caption" component="div">
          {fieldTypeLabel(field.type)}
        </Typography>
        <code style={{ fontSize: '0.65rem' }}>{field.type}</code>
      </TableCell>
      <TableCell sx={{ maxWidth: 160 }}>
        <Typography variant="caption">{optionsSummary}</Typography>
        {hasOptionsJson && (
          <Box
            component="pre"
            sx={{
              m: 0,
              mt: 0.5,
              p: 0.5,
              fontSize: '0.6rem',
              bgcolor: 'grey.50',
              borderRadius: 0.5,
              overflow: 'auto',
              maxHeight: 72,
            }}
          >
            {JSON.stringify(field.options, null, 2)}
          </Box>
        )}
      </TableCell>
      <TableCell sx={{ maxWidth: 100 }}>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {requiredHintLabel(zod.requiredHint)}
        </Typography>
        <Typography
          variant="caption"
          component="code"
          sx={{ fontSize: '0.6rem', wordBreak: 'break-all' }}
        >
          {zod.zodExpr}
        </Typography>
      </TableCell>
      <TableCell>
        <code style={{ fontSize: '0.7rem' }}>{field.id}</code>
      </TableCell>
    </TableRow>
  )
}

export function TableDetailFlyout({
  open,
  onClose,
  table,
  loading = false,
  error = null,
}: TableDetailFlyoutProps) {
  const snippet = useMemo(
    () => (table ? generateTableConfigSnippet(table) : ''),
    [table],
  )
  const zodSnippet = useMemo(
    () => (table ? generateZodSchemaSnippet(table) : ''),
    [table],
  )
  const crudHookSnippet = useMemo(
    () => (table ? generateCrudHookSnippet(table) : ''),
    [table],
  )
  const queryHooksSnippet = useMemo(
    () => (table ? generateQueryHooksSnippet(table) : ''),
    [table],
  )
  const codegenNames = useMemo(() => {
    if (!table) return null
    const configKey = configKeyFromTableName(table.name)
    return {
      configKey,
      pascal: pascalFromConfigKey(configKey),
      hookName: hookNameFromConfigKey(configKey),
    }
  }, [table])

  const handleCopySnippet = async () => {
    if (!snippet) return
    await navigator.clipboard.writeText(snippet)
  }

  const handleCopyZod = async () => {
    if (!zodSnippet) return
    await navigator.clipboard.writeText(zodSnippet)
  }

  const handleCopyCrudHook = async () => {
    if (!crudHookSnippet) return
    await navigator.clipboard.writeText(crudHookSnippet)
  }

  const handleCopyQueryHooks = async () => {
    if (!queryHooksSnippet) return
    await navigator.clipboard.writeText(queryHooksSnippet)
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 640 }, maxWidth: '100%' },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6" component="h2">
          Table details
        </Typography>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && table && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {table.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <code>{table.id}</code>
            </Typography>
            {table.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {table.description}
              </Typography>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 2 }}
            >
              Primary field: <strong>{primaryFieldName(table)}</strong>
            </Typography>

            <DetailAccordion
              title={`Views (${table.views.length})`}
              defaultExpanded
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {table.views.map((v) => (
                  <Chip
                    key={v.id}
                    size="small"
                    label={`${v.name} (${v.type})`}
                    variant="outlined"
                  />
                ))}
              </Box>
            </DetailAccordion>

            <DetailAccordion
              title={`Fields (${table.fields.length})`}
              defaultExpanded
            >
              <Alert severity="info" sx={{ mb: 2 }}>
                For <strong>Zod</strong>, we infer types and constraints from Airtable (select
                choices, rating max, link shape, etc.). <strong>Required</strong> is only known for
                the primary field; form-required flags are not in the API — add{' '}
                <code>validation: {'{ fieldKey: { required: true } }'}</code> in{' '}
                <code>tables.ts</code> or edit the generated schema.
              </Alert>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Options / constraints</TableCell>
                      <TableCell>Zod / required</TableCell>
                      <TableCell>Field ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {table.fields.map((f) => (
                      <FieldRow
                        key={f.id}
                        field={f}
                        isPrimary={f.id === table.primaryFieldId}
                        primaryFieldId={table.primaryFieldId}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DetailAccordion>

            <DetailAccordion
              title="tables.ts config"
              subtitle="Paste into src/config/tables.ts → airtableTables"
              defaultExpanded
              onCopy={handleCopySnippet}
            >
              <Box
                component="pre"
                sx={{ ...preSx, fontSize: '0.7rem', maxHeight: 320 }}
              >
                {snippet}
              </Box>
            </DetailAccordion>

            <DetailAccordion
              title="Zod schemas"
              subtitle={
                codegenNames
                  ? `src/validation/${codegenNames.pascal}.ts (create / patch / record)`
                  : 'create / patch / record'
              }
              onCopy={handleCopyZod}
            >
              <Box
                component="pre"
                sx={{ ...preSx, fontSize: '0.65rem', maxHeight: 360 }}
              >
                {zodSnippet}
              </Box>
            </DetailAccordion>

            <DetailAccordion
              title="CRUD hook"
              subtitle={
                codegenNames
                  ? `src/hooks/${codegenNames.hookName}.ts`
                  : undefined
              }
              onCopy={handleCopyCrudHook}
            >
              <Box
                component="pre"
                sx={{ ...preSx, fontSize: '0.65rem', maxHeight: 420 }}
              >
                {crudHookSnippet}
              </Box>
            </DetailAccordion>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                Scaffold screen
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                One-click snippets for a list screen wired to this table’s hook.
              </Typography>
              <ScreenScaffoldPanel tableName={table.name} compact />
            </Box>

            <DetailAccordion
              title="Query hooks (TanStack Query)"
              subtitle={
                codegenNames
                  ? `Append to src/hooks/${codegenNames.hookName}.ts`
                  : 'List / record queries + mutations'
              }
              onCopy={handleCopyQueryHooks}
            >
              <Box
                component="pre"
                sx={{ ...preSx, fontSize: '0.65rem', maxHeight: 360 }}
              >
                {queryHooksSnippet}
              </Box>
            </DetailAccordion>
          </>
        )}
      </Box>
    </Drawer>
  )
}
