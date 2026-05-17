import type { ReactNode } from 'react'
import type { DataTableColumn, DataTableRowActions } from '../table/types.ts'

/** App record presentation: table (grid) or card grid. */
export type RecordViewMode = 'grid' | 'card'

export type RecordRowActions<T> = DataTableRowActions<T>

export interface RecordCardField<T> {
  id: string
  label: string
  render: (row: T) => ReactNode
}

/** Layout for {@link RecordCard} / {@link RecordCardGrid}. */
export interface RecordCardLayout<T> {
  title: (row: T) => ReactNode
  subtitle?: (row: T) => ReactNode
  fields?: readonly RecordCardField<T>[]
  footer?: (row: T) => ReactNode
}

export interface RecordCollectionTableProps<T> {
  columns: readonly DataTableColumn<T>[]
  stickyHeader?: boolean
}

export interface RecordCollectionViewProps<T> {
  viewMode: RecordViewMode
  rows: readonly T[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  rowActions?: RecordRowActions<T>
  table: RecordCollectionTableProps<T>
  card: RecordCardLayout<T>
}
