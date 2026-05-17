import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import TableChartIcon from '@mui/icons-material/TableChart'
import { PageContainer } from '../main/PageContainer.tsx'
import { PageHeader } from '../main/PageHeader.tsx'
import { PageContents } from '../main/PageContents.tsx'
import { Loading } from '../main/Loading.tsx'
import { EmptyState } from '../main/EmptyState.tsx'
import { InlineError } from '../main/InlineError.tsx'
import {
  RecordCollectionView,
  RecordViewToggle,
  type RecordViewMode,
} from '../ui/index.ts'
import { getTableConfig, type TableKey } from '../../config/tables.ts'
import type { AppView } from '../main/appView.ts'
import { getScreenTitle } from '../../config/screens.ts'
import { useAirtableListQuery } from '../../hooks/useAirtableTableQuery.ts'
import { useRecordViewMode } from '../../hooks/useRecordViewMode.ts'
import { getListColumns } from '../../lib/tables/getListColumns.ts'
import { cardLayoutFromListColumns } from '../../lib/tables/cardLayoutFromColumns.ts'
import { listColumnsToDataColumns } from '../../lib/tables/listColumnsToDataColumns.tsx'
import type { ListRecordsQuery } from '../../lib/airtable/types.ts'

export interface ListScreenProps {
  /** `tables.ts` entry key */
  tableKey: TableKey
  /** For `getScreenTitle` when the screen id matches a registered `AppView`. */
  viewId?: AppView
  title?: string
  icon?: ReactNode
  listQuery?: ListRecordsQuery
  /** Initial grid vs card layout (default `grid`). */
  defaultViewMode?: RecordViewMode
}

/**
 * Generic list screen: reads `tables.ts` columns, loads data via TanStack Query.
 * Only requires table config + Airtable connection (no generated CRUD hook).
 */
export function ListScreen({
  tableKey,
  viewId,
  title,
  icon,
  listQuery,
  defaultViewMode = 'grid',
}: ListScreenProps) {
  const config = getTableConfig(tableKey)
  const listColumns = config ? getListColumns(config) : []
  const listScreenId = viewId ?? `list:${tableKey}`
  const [viewMode, setViewMode] = useRecordViewMode(listScreenId, defaultViewMode)
  const { data, isLoading, isError, error, refetch } = useAirtableListQuery(
    tableKey,
    listQuery,
    { enabled: !!config },
  )

  const records = data?.records ?? []
  const headerTitle =
    title ?? (viewId ? getScreenTitle(viewId) : config?.label ?? tableKey)

  if (!config) {
    return (
      <PageContainer>
        <PageHeader
          title={headerTitle}
          icon={icon ?? <TableChartIcon color="primary" />}
        />
        <PageContents>
          <EmptyState
            variant="compact"
            title="Table not configured"
            description={
              <>
                No table config for <code>{tableKey}</code>. Paste an entry from
                Developer → Tables into <code>src/config/tables.ts</code>.
              </>
            }
            sx={{ px: 2, py: 2 }}
          />
        </PageContents>
      </PageContainer>
    )
  }

  const dataColumns = listColumnsToDataColumns(listColumns, config.primaryField)
  const cardLayout = cardLayoutFromListColumns(listColumns, config.primaryField)

  return (
    <PageContainer>
      <PageHeader
        title={headerTitle}
        icon={icon ?? <TableChartIcon color="primary" />}
        count={records.length}
        action={
          <RecordViewToggle value={viewMode} onChange={setViewMode} />
        }
      />
      <PageContents>
        {isLoading ? <Loading /> : null}
        {isError ? (
          <InlineError
            message={error?.message ?? 'Failed to load records'}
            onRetry={() => void refetch()}
          />
        ) : null}
        {!isLoading && !isError ? (
          <>
            {data?.offset ? (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                More records available (Airtable returned an offset). This template
                shows the first page only.
              </Typography>
            ) : null}
            <RecordCollectionView
              viewMode={viewMode}
              rows={records}
              getRowId={(r) => r.id}
              emptyTitle="No records yet"
              emptyDescription="Create rows in Airtable or adjust your list filter."
              table={{ columns: dataColumns }}
              card={cardLayout}
            />
          </>
        ) : null}
      </PageContents>
    </PageContainer>
  )
}
