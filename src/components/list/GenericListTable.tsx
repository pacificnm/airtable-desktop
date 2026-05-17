import Typography from '@mui/material/Typography'
import { DataTable } from '../ui/table/DataTable.tsx'
import type { DataTableColumn } from '../ui/table/types.ts'
import type { ListColumnDef } from '../../lib/tables/getListColumns.ts'
import { formatCellValue } from '../../lib/tables/formatCellValue.ts'
import type { NormalizedRecord } from '../../lib/airtable/mapRecordFields.ts'

export interface GenericListTableProps {
  columns: readonly ListColumnDef[]
  records: readonly NormalizedRecord<Record<string, unknown>>[]
  /** Emphasize this field column (typically `primaryField`). */
  primaryField?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function GenericListTable({
  columns,
  records,
  primaryField,
  emptyTitle = 'No records yet',
  emptyDescription,
}: GenericListTableProps) {
  const dataColumns: DataTableColumn<NormalizedRecord<Record<string, unknown>>>[] =
    columns.map((col) => ({
      id: col.field,
      label: col.label,
      primary: col.field === primaryField,
      render: (record) => {
        const text = formatCellValue(record.fields[col.field])
        return (
          <Typography variant="body2" component="span" title={text}>
            {text}
          </Typography>
        )
      },
    }))

  return (
    <DataTable
      rows={records}
      columns={dataColumns}
      getRowId={(r) => r.id}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  )
}
