import Box from '@mui/material/Box'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { EmptyState } from '../../main/EmptyState.tsx'
import { RecordCard } from './RecordCard.tsx'
import type { RecordCardLayout, RecordRowActions } from '../record/recordTypes.ts'

export interface RecordCardGridProps<T> {
  rows: readonly T[]
  layout: RecordCardLayout<T>
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  rowActions?: RecordRowActions<T>
}

export function RecordCardGrid<T>({
  rows,
  layout,
  getRowId,
  onRowClick,
  emptyTitle = 'No records yet',
  emptyDescription,
  rowActions,
}: RecordCardGridProps<T>) {
  if (rows.length === 0) {
    return (
      <EmptyState
        variant="compact"
        icon={<InboxOutlinedIcon />}
        title={emptyTitle}
        description={emptyDescription}
        sx={{ py: 2 }}
      />
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 2,
      }}
    >
      {rows.map((row) => (
        <RecordCard
          key={getRowId(row)}
          row={row}
          title={layout.title(row)}
          subtitle={layout.subtitle?.(row)}
          fields={layout.fields}
          footer={layout.footer?.(row)}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          rowActions={rowActions}
        />
      ))}
    </Box>
  )
}
