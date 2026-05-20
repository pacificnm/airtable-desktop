import { configKeyFromTableName, pascalFromConfigKey } from '../airtable/tableCodegen.ts'
import { fieldNameToConfigKey } from '../airtable/mapTableFields.ts'
import type { MetaTableSchema } from '../airtable/metaTypes.ts'
import type { AirtableTableConfig } from '../../config/tableTypes.ts'
import {
  generateModuleFieldsMetaFileContent,
  generateModuleTablesFileContent,
} from './generateModuleTablesFile.ts'
import { getDiscoveredModules } from './registry.ts'

export interface ScaffoldModuleFromTableInput {
  meta: MetaTableSchema
  /** Folder under `module-repos/` (defaults from table name). */
  moduleId?: string
  /** tables.ts `key` (defaults from table name). */
  tableKey?: string
  menuSectionId?: string
  menuSectionLabel?: string
  menuSectionScope?: 'module' | 'global'
  menuSectionOrder?: number
  menuItemOrder?: number
}

export interface ScaffoldModuleFile {
  relativePath: string
  content: string
}

const RESERVED_MODULE_IDS = new Set([
  'config',
  'roles',
  'users',
  'notifications',
])

export function moduleIdFromTable(meta: MetaTableSchema, override?: string): string {
  return override?.trim() || configKeyFromTableName(meta.name)
}

export function isReservedModuleId(moduleId: string): boolean {
  return RESERVED_MODULE_IDS.has(moduleId)
}

export function moduleFolderExists(moduleId: string): boolean {
  return getDiscoveredModules().some((m) => m.definition.id === moduleId)
}

function stubTableConfig(
  tableKey: string,
  meta: MetaTableSchema,
  screenId: string,
): AirtableTableConfig {
  const primaryFieldName =
    meta.fields.find((f) => f.id === meta.primaryFieldId)?.name ??
    meta.fields[0]?.name ??
    'Name'
  const primaryFieldKey = fieldNameToConfigKey(primaryFieldName)

  return {
    key: tableKey,
    label: meta.name,
    tableId: meta.id,
    tableName: meta.name,
    primaryField: primaryFieldKey,
    fields: {},
    columns: [],
    screens: [screenId],
    validation: {
      [primaryFieldKey]: { required: true },
    },
  }
}

/**
 * Generate all files for a one-table module under `module-repos/<moduleId>/`.
 * Caller writes via Electron `writeModuleFile` in dev.
 */
export function scaffoldModuleFiles(
  input: ScaffoldModuleFromTableInput,
): ScaffoldModuleFile[] {
  const { meta } = input
  const moduleId = moduleIdFromTable(meta, input.moduleId)
  const tableKey = input.tableKey?.trim() || configKeyFromTableName(meta.name)
  const pascal = pascalFromConfigKey(tableKey)
  const screenId = `${tableKey}List`
  const tableConfig = stubTableConfig(tableKey, meta, screenId)
  const menuSectionId = input.menuSectionId ?? 'reference'
  const menuSectionLabel = input.menuSectionLabel ?? 'Reference data'
  const menuSectionScope = input.menuSectionScope ?? 'global'
  const menuSectionOrder = input.menuSectionOrder ?? 200
  const menuItemOrder = input.menuItemOrder ?? 100

  const tablesTs = generateModuleTablesFileContent(moduleId, [tableConfig], [meta])
  const tablesMetaTs = generateModuleFieldsMetaFileContent(
    moduleId,
    [tableConfig],
    [meta],
  )

  const validationConst = `${tableKey.toUpperCase()}_TABLE_KEY`

  return [
    {
      relativePath: 'moduleConfig.ts',
      content: `/** Set false after fields are verified in Airtable. */\nexport const ${moduleId}ModuleReadOnly = true\n`,
    },
    {
      relativePath: 'tables.ts',
      content: tablesTs,
    },
    {
      relativePath: 'tables.meta.ts',
      content: tablesMetaTs,
    },
    {
      relativePath: `validation/${tableKey}.ts`,
      content: `import { getTableConfig } from '@/config/tables.ts'
import type { AirtableTableConfig } from '@/config/tables.ts'

export const ${validationConst} = '${tableKey}'

export function get${pascal}TableConfig(): AirtableTableConfig | undefined {
  return getTableConfig(${validationConst})
}
`,
    },
    {
      relativePath: `lib/${tableKey}FromRecords.ts`,
      content: `import type { NormalizedRecord } from '@/lib/airtable/mapRecordFields.ts'

export interface ${pascal} {
  id: string
  ${tableConfig.primaryField}: string
}

type RowFields = Record<string, unknown>

function asString(raw: unknown): string | undefined {
  if (raw == null) return undefined
  if (typeof raw === 'string') {
    const value = raw.trim()
    return value || undefined
  }
  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw)
  }
  return undefined
}

export function recordTo${pascal}(
  record: NormalizedRecord<RowFields>,
): ${pascal} | null {
  const label = asString(record.fields.${tableConfig.primaryField})
  if (!label) return null
  return { id: record.id, ${tableConfig.primaryField}: label }
}

export function ${tableKey}sFromRecords(
  records: readonly NormalizedRecord<RowFields>[],
): ${pascal}[] {
  return records
    .map(recordTo${pascal})
    .filter((row): row is ${pascal} => row != null)
}
`,
    },
    {
      relativePath: `lib/${tableKey}ListColumns.tsx`,
      content: `import { DataTableText, type DataTableColumn } from '@/components/ui/index.ts'
import type { ${pascal} } from './${tableKey}FromRecords.ts'

export function ${tableKey}ListColumns(): DataTableColumn<${pascal}>[] {
  return [
    {
      id: '${tableConfig.primaryField}',
      label: '${tableConfig.primaryField}',
      primary: true,
      render: (row) => <DataTableText>{row.${tableConfig.primaryField}}</DataTableText>,
    },
  ]
}
`,
    },
    {
      relativePath: `hooks/use${pascal}.ts`,
      content: `import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTableConfig } from '@/config/tables.ts'
import { useAirtable } from '@/hooks/useAirtable.ts'
import { normalizeRecord } from '@/lib/airtable/mapRecordFields.ts'
import { ${tableKey}sFromRecords, type ${pascal} } from '../lib/${tableKey}FromRecords.ts'
import { ${validationConst}, get${pascal}TableConfig } from '../validation/${tableKey}.ts'

export function use${pascal}() {
  const { client, isReady, baseId } = useAirtable()
  const tableConfig = get${pascal}TableConfig()

  const query = useQuery({
    queryKey: ['airtable', ${validationConst}, 'list', baseId ?? 'none'],
    enabled: isReady && !!client && !!tableConfig,
    queryFn: async (): Promise<${pascal}[]> => {
      if (!client || !tableConfig) return []
      const { records } = await client.listAllRecords<Record<string, unknown>>(
        tableConfig.tableId,
        { pageSize: 100, maxTotal: 5000 },
      )
      const normalized = records.map((record) =>
        normalizeRecord<Record<string, unknown>>(tableConfig, record),
      )
      return ${tableKey}sFromRecords(normalized)
    },
  })

  const configError = useMemo(() => {
    if (!isReady) return null
    if (!getTableConfig(${validationConst})) {
      return \`Table config missing for "\${${validationConst}}". Enable the ${moduleId} module and sync schema.\`
    }
    if (!get${pascal}TableConfig()) {
      return 'Table is not configured. Developer → Modules → ${moduleId} → Sync schema from Airtable.'
    }
    return null
  }, [isReady])

  return {
    rows: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError || Boolean(configError),
    error: configError ? new Error(configError) : query.error,
    refetch: query.refetch,
    configError,
  }
}
`,
    },
    {
      relativePath: `screens/${pascal}ListScreen.tsx`,
      content: `import TableChartIcon from '@mui/icons-material/TableChart'
import Alert from '@mui/material/Alert'
import { RecordCollectionView, RecordListPage } from '@/components/ui/index.ts'
import { useRecordViewMode } from '@/hooks/useRecordViewMode.ts'
import { useAirtable } from '@/hooks/useAirtable.ts'
import { ${tableKey}ListColumns } from '../lib/${tableKey}ListColumns.tsx'
import { use${pascal} } from '../hooks/use${pascal}.ts'
import { ${moduleId}ModuleReadOnly } from '../moduleConfig.ts'

export default function ${pascal}ListScreen() {
  const { isReady } = useAirtable()
  const { rows, isLoading, isError, error, refetch, configError } = use${pascal}()
  const [viewMode, setViewMode] = useRecordViewMode('${screenId}')

  return (
    <RecordListPage
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      header={{
        title: '${meta.name.replace(/'/g, "\\'")}',
        icon: <TableChartIcon color="primary" />,
        count: rows.length,
      }}
      banner={
        configError ? (
          <Alert severity="error">{configError}</Alert>
        ) : ${moduleId}ModuleReadOnly ? (
          <Alert severity="info">
            Read-only list. Sync schema from Airtable, verify fields, then set{' '}
            <code>${moduleId}ModuleReadOnly</code> to false in moduleConfig.ts to allow edits.
          </Alert>
        ) : null
      }
      isLoading={isLoading}
      isError={isError || Boolean(configError)}
      errorMessage={configError ?? error?.message}
      onRetry={refetch}
    >
      <RecordCollectionView
        viewMode={viewMode}
        rows={rows}
        getRowId={(row) => row.id}
        emptyTitle="No records found"
        emptyDescription={
          !isReady
            ? 'Connect to Airtable to load data.'
            : 'Add records in Airtable or check table configuration.'
        }
        table={{ columns: ${tableKey}ListColumns() }}
        card={{ title: (row) => row.${tableConfig.primaryField} }}
      />
    </RecordListPage>
  )
}
`,
    },
    {
      relativePath: 'index.ts',
      content: `import type { AppModuleDefinition } from '@/lib/modules/types.ts'
import { ${moduleId}ModuleTables } from './tables.ts'

const ${moduleId}Module = {
  id: '${moduleId}',
  name: '${meta.name.replace(/'/g, "\\'")}',
  version: '0.1.0',
  dependsOn: ['config'] as const,
  description: 'Airtable table "${meta.name.replace(/'/g, "\\'")}" (schema from Meta API).',
  readmePath: 'README.md',
  airtableSetupPath: 'airtable-setup.md',
  tables: ${moduleId}ModuleTables,
  screens: [
    {
      id: '${screenId}',
      title: '${meta.name.replace(/'/g, "\\'")}',
      importScreen: () => import('./screens/${pascal}ListScreen.tsx'),
    },
  ],
  menuNav: {
    groups: [
      {
        id: '${menuSectionId}',
        label: '${menuSectionLabel.replace(/'/g, "\\'")}',
        scope: '${menuSectionScope}',
        order: ${menuSectionOrder},
      },
    ],
  },
  menuItems: [
    {
      id: '${tableKey}-list',
      label: '${meta.name.replace(/'/g, "\\'")}',
      icon: 'gridView',
      viewId: '${screenId}',
      menuGroupId: '${menuSectionId}',
      order: ${menuItemOrder},
    },
  ],
} satisfies AppModuleDefinition

export default ${moduleId}Module
`,
    },
    {
      relativePath: 'README.md',
      content: `# ${meta.name} module

One-table module for Airtable **${meta.name}** (\`${meta.id}\`).

1. Enable **${moduleId}** in Developer → Modules.
2. **Sync schema from Airtable** (rewrites \`tables.ts\` / \`tables.meta.ts\`).
3. Reload the app and open **${meta.name}** in the drawer.

Module id: \`${moduleId}\`  
Table key: \`${tableKey}\`
`,
    },
    {
      relativePath: 'airtable-setup.md',
      content: `# ${meta.name} — setup

Existing table in the Shared base. This module does not create schema.

- Table id: \`${meta.id}\`
- Primary field: ${tableConfig.primaryField}
`,
    },
  ]
}
