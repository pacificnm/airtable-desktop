import { DataTable } from '../table/DataTable.tsx'
import { RecordCardGrid } from '../card/RecordCardGrid.tsx'
import type { RecordCollectionViewProps } from './recordTypes.ts'

/** Renders records as a table (grid) or card grid based on {@link RecordViewMode}. */
export function RecordCollectionView<T>({
  viewMode,
  rows,
  getRowId,
  onRowClick,
  emptyTitle,
  emptyDescription,
  rowActions,
  table,
  card,
}: RecordCollectionViewProps<T>) {
  if (viewMode === 'card') {
    return (
      <RecordCardGrid
        rows={rows}
        layout={card}
        getRowId={getRowId}
        onRowClick={onRowClick}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        rowActions={rowActions}
      />
    )
  }

  return (
    <DataTable
      rows={rows}
      columns={table.columns}
      getRowId={getRowId}
      onRowClick={onRowClick}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      rowActions={rowActions}
      stickyHeader={table.stickyHeader}
    />
  )
}
