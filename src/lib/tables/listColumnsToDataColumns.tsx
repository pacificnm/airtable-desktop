import { DataTableText, type DataTableColumn } from '../../components/ui/index.ts'
import { formatCellValue } from './formatCellValue.ts'
import type { ListColumnDef } from './getListColumns.ts'
import type { NormalizedRecord } from '../airtable/mapRecordFields.ts'

export function listColumnsToDataColumns(
  columns: readonly ListColumnDef[],
  primaryField?: string,
): DataTableColumn<NormalizedRecord<Record<string, unknown>>>[] {
  return columns.map((col) => ({
    id: col.field,
    label: col.label,
    primary: col.field === primaryField,
    render: (record) => {
      const text = formatCellValue(record.fields[col.field])
      return <DataTableText title={text}>{text}</DataTableText>
    },
  }))
}
