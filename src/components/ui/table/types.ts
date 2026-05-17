import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  id: string
  label: string
  /** Emphasize column (typically name/key). */
  primary?: boolean
  align?: 'left' | 'right' | 'center'
  width?: number | string
  maxWidth?: number
  render: (row: T) => ReactNode
}

export interface DataTableRowActions<T> {
  onEdit: (row: T) => void
  onDelete: (row: T) => void
  editAriaLabel?: (row: T) => string
  deleteAriaLabel?: (row: T) => string
}
