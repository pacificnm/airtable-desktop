import type { ReactNode } from 'react'
import type { Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { EmptyState } from '../../main/EmptyState.tsx'
import type { DataTableColumn, DataTableRowActions } from './types.ts'

const ACTIONS_WIDTH = 96

export interface DataTableProps<T> {
  rows: readonly T[]
  columns: readonly DataTableColumn<T>[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  rowActions?: DataTableRowActions<T>
  /** Optional per-row background / hover overrides (e.g. sync result highlights). */
  getRowSx?: (row: T) => SystemStyleObject<Theme> | undefined
  /** Sticky header row (off by default — matches Developer → Tables). */
  stickyHeader?: boolean
}

/**
 * Default app table: outlined Paper container, small size, hover rows.
 * Matches `DeveloperTables` / theme table preview.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  emptyTitle = 'No records yet',
  emptyDescription,
  rowActions,
  getRowSx,
  stickyHeader = false,
}: DataTableProps<T>) {
  const colSpan = columns.length + (rowActions ? 1 : 0)

  const bodyCellSx = (col: DataTableColumn<T>) =>
    col.maxWidth != null
      ? {
          maxWidth: col.maxWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }
      : undefined

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align}
                sx={col.width != null ? { width: col.width } : undefined}
              >
                {col.label}
              </TableCell>
            ))}
            {rowActions ? (
              <TableCell align="right" sx={{ width: ACTIONS_WIDTH }}>
                Actions
              </TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} sx={{ py: 0, borderBottom: 0 }}>
                <EmptyState
                  variant="compact"
                  icon={<InboxOutlinedIcon />}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const highlightSx = getRowSx?.(row)
              const rowSx: SystemStyleObject<Theme> | undefined =
                onRowClick || highlightSx
                  ? {
                      ...(onRowClick ? { cursor: 'pointer' } : {}),
                      ...highlightSx,
                    }
                  : undefined
              return (
              <TableRow
                key={getRowId(row)}
                hover
                sx={rowSx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align} sx={bodyCellSx(col)}>
                    {col.render(row)}
                  </TableCell>
                ))}
                {rowActions ? (
                  <TableCell
                    align="right"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ width: ACTIONS_WIDTH }}
                  >
                    <RowActionButtons row={row} rowActions={rowActions} />
                  </TableCell>
                ) : null}
              </TableRow>
            )})
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function RowActionButtons<T>({
  row,
  rowActions,
}: {
  row: T
  rowActions: DataTableRowActions<T>
}) {
  const editLabel = rowActions.editAriaLabel?.(row) ?? 'Edit'
  const deleteLabel = rowActions.deleteAriaLabel?.(row) ?? 'Delete'
  return (
    <>
      <IconButton
        size="small"
        aria-label={editLabel}
        onClick={() => rowActions.onEdit(row)}
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label={deleteLabel}
        onClick={() => rowActions.onDelete(row)}
      >
        <DeleteOutlineOutlinedIcon fontSize="small" />
      </IconButton>
    </>
  )
}

export function DataTableText({
  children,
  title,
  secondary,
  noWrap = false,
  mono,
}: {
  children: ReactNode
  title?: string
  secondary?: boolean
  noWrap?: boolean
  mono?: boolean
}) {
  return (
    <Typography
      variant="body2"
      component="span"
      noWrap={noWrap}
      title={title}
      color={secondary ? 'text.secondary' : 'text.primary'}
      sx={
        mono
          ? { fontFamily: 'monospace', fontSize: 'inherit' }
          : undefined
      }
    >
      {children}
    </Typography>
  )
}
