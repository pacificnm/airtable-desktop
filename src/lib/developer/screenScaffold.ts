import {
  configKeyFromTableName,
  hookNameFromConfigKey,
  pascalFromConfigKey,
} from '../airtable/tableCodegen.ts'

export interface ScreenScaffoldInput {
  /** Table config `key` — also used as `AppView` id. */
  configKey: string
  /** Screen title in `screens.ts` and page header. */
  screenTitle: string
  /** Drawer menu label. */
  menuLabel: string
  /** Drawer section label (e.g. "App"). */
  menuSectionLabel?: string
  /** Use generated `useXListQuery()` (requires query hooks pasted). */
  useListQuery?: boolean
  /** `list` = shared {@link ListScreen} component; `inline` = full generated table UI. */
  screenTemplate?: 'list' | 'inline'
}

export interface ScreenScaffoldFile {
  path: string
  description: string
  kind: 'create' | 'patch'
  content: string
}

export interface ScreenScaffoldBundle {
  viewId: string
  files: ScreenScaffoldFile[]
}

const RESERVED_VIEWS = new Set([
  'home',
  'devTables',
  'devDocs',
  'devTokens',
  'devTheme',
])

export function screenScaffoldFromTableName(
  tableName: string,
  overrides?: Partial<ScreenScaffoldInput>,
): ScreenScaffoldBundle {
  const configKey = overrides?.configKey ?? configKeyFromTableName(tableName)
  return generateScreenScaffold({
    configKey,
    screenTitle: overrides?.screenTitle ?? tableName,
    menuLabel: overrides?.menuLabel ?? tableName,
    menuSectionLabel: overrides?.menuSectionLabel ?? 'App',
    useListQuery: overrides?.useListQuery ?? true,
    screenTemplate: overrides?.screenTemplate ?? 'list',
  })
}

export function isReservedViewId(viewId: string): boolean {
  return RESERVED_VIEWS.has(viewId)
}

export function generateScreenScaffold(input: ScreenScaffoldInput): ScreenScaffoldBundle {
  const viewId = input.configKey.trim()
  const pascal = pascalFromConfigKey(viewId)
  const hookName = hookNameFromConfigKey(viewId)
  const screenFile = `src/screens/${pascal}.tsx`
  const menuSection = input.menuSectionLabel ?? 'App'
  const useQuery = input.useListQuery !== false
  const template = input.screenTemplate ?? 'list'

  const files: ScreenScaffoldFile[] = [
    {
      path: screenFile,
      description:
        template === 'list'
          ? 'Thin wrapper around shared ListScreen (create this file)'
          : 'New screen component (create this file)',
      kind: 'create',
      content: generateScreenFile({
        pascal,
        viewId,
        hookName,
        screenTitle: input.screenTitle,
        useListQuery: useQuery,
        template,
      }),
    },
    {
      path: 'src/components/main/appView.ts',
      description: 'Add view id to AppView union',
      kind: 'patch',
      content: generateAppViewPatch(viewId),
    },
    {
      path: 'src/config/screens.ts',
      description: 'Register screen title + lazy import',
      kind: 'patch',
      content: generateScreensPatch(viewId, input.screenTitle, pascal),
    },
    {
      path: 'src/config/menu.ts',
      description: `Add menu item under “${menuSection}”`,
      kind: 'patch',
      content: generateMenuPatch(viewId, input.menuLabel, menuSection),
    },
    {
      path: 'src/config/tables.ts',
      description: 'Link table to this screen',
      kind: 'patch',
      content: generateTablesPatch(viewId),
    },
  ]

  return { viewId, files }
}

export function bundleToClipboardText(bundle: ScreenScaffoldBundle): string {
  return bundle.files
    .map(
      (f) =>
        `// ─── ${f.path} (${f.kind}) — ${f.description} ───\n${f.content.trim()}\n`,
    )
    .join('\n')
}

function generateScreenFile(options: {
  pascal: string
  viewId: string
  hookName: string
  screenTitle: string
  useListQuery: boolean
  template: 'list' | 'inline'
}): string {
  const { pascal, viewId, hookName, screenTitle, useListQuery, template } = options

  if (template === 'list') {
    const safeTitle = screenTitle.replace(/'/g, "\\'")
    return `import { ListScreen } from '../components/list/ListScreen.tsx'

/**
 * ${screenTitle} — uses the generic list template (\`tables.ts\` columns).
 * Requires table config + Airtable connection only.
 */
export default function ${pascal}() {
  return <ListScreen tableKey="${viewId}" title="${safeTitle}" />
}
`
  }

  const listQueryFn = `${hookName}ListQuery`

  const dataBlock = useListQuery
    ? `  const { data, isLoading, isError, error, refetch } = ${listQueryFn}()`
    : `  const api = ${hookName}()
  const [records, setRecords] = useState<Awaited<ReturnType<typeof api.list>>['records']>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!api.isReady) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    void api
      .list()
      .then((res) => {
        if (!cancelled) setRecords(res.records)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load'))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [api])`

  const extraImports = useListQuery
    ? `import { ${listQueryFn} } from '../hooks/${hookName}.ts'`
    : `import { useEffect, useState } from 'react'
import { ${hookName} } from '../hooks/${hookName}.ts'`

  const recordsExpr = useListQuery ? 'data?.records ?? []' : 'records'
  const countExpr = useListQuery ? 'data?.records.length' : 'records.length'
  const errorBlock = useListQuery
    ? `        {isError ? (
          <InlineError
            message={error?.message ?? 'Failed to load records'}
            onRetry={() => void refetch()}
          />
        ) : null}`
    : `        {error ? (
          <InlineError message={error.message} />
        ) : null}`

  return `import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableChartIcon from '@mui/icons-material/TableChart'
import { PageContainer } from '../components/main/PageContainer.tsx'
import { PageHeader } from '../components/main/PageHeader.tsx'
import { PageContents } from '../components/main/PageContents.tsx'
import { Loading } from '../components/main/Loading.tsx'
import { InlineError } from '../components/main/InlineError.tsx'
import { EmptyState } from '../components/main/EmptyState.tsx'
import { getScreenTitle } from '../config/screens.ts'
${extraImports}

/**
 * ${screenTitle} — starter list screen for table \`${viewId}\`.
 * Requires \`tables.ts\`, validation, CRUD hook${useListQuery ? ', and query hooks' : ''}.
 */
export default function ${pascal}() {
${dataBlock}

  return (
    <PageContainer>
      <PageHeader
        title={getScreenTitle('${viewId}')}
        icon={<TableChartIcon color="primary" />}
        count={${countExpr}}
      />
      <PageContents>
        {isLoading ? <Loading /> : null}
${errorBlock}
        {!isLoading && !${useListQuery ? 'isError' : 'error'} ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Record</TableCell>
                  <TableCell>Fields</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {${recordsExpr}.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ py: 0, borderBottom: 0 }}>
                      <EmptyState variant="compact" title="No records yet" />
                    </TableCell>
                  </TableRow>
                ) : (
                  ${recordsExpr}.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {record.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" component="pre" sx={{ m: 0 }}>
                          {JSON.stringify(record.fields, null, 2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </PageContents>
    </PageContainer>
  )
}
`
}

function generateAppViewPatch(viewId: string): string {
  return `// In src/components/main/appView.ts, add to the AppView union:
export type AppView =
  | 'home'
  | 'devTables'
  // ... existing developer views ...
  | '${viewId}'   // ← add this line`
}

function generateScreensPatch(
  viewId: string,
  title: string,
  pascal: string,
): string {
  const safeTitle = title.replace(/'/g, "\\'")
  return `// In src/config/screens.ts:

// 1) Add to screens array:
  { id: '${viewId}', title: '${safeTitle}' },

// 2) Add to screenImporters:
  ${viewId}: () => import('../screens/${pascal}.tsx'),`
}

function generateMenuPatch(
  viewId: string,
  menuLabel: string,
  sectionLabel: string,
): string {
  const safeLabel = menuLabel.replace(/'/g, "\\'")
  return `// In src/config/menu.ts:

// Add a section (or append an item to an existing "${sectionLabel}" section):
  {
    id: 'app',
    label: '${sectionLabel}',
    items: [
      {
        id: '${viewId}',
        label: '${safeLabel}',
        icon: 'gridView',
        isSelected: (v) => v === '${viewId}',
        resolveNavigate: () => '${viewId}',
      },
    ],
  },
// Uses menu icon \`gridView\` (already mapped in Menu.tsx).`
}

function generateTablesPatch(viewId: string): string {
  return `// In src/config/tables.ts, on your table entry add:
  screens: ['${viewId}'],`
}
