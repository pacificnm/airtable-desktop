import type { ReactNode } from 'react'
import type { RecordCardLayout } from '../../components/ui/record/recordTypes.ts'
import type { DataTableColumn } from '../../components/ui/table/types.ts'
import { formatCellValue } from './formatCellValue.ts'
import type { NormalizedRecord } from '../airtable/mapRecordFields.ts'

/** Build a simple card layout from table column definitions (ListScreen). */
export function cardLayoutFromDataColumns<T>(
  columns: readonly DataTableColumn<T>[],
): RecordCardLayout<T> {
  const primary = columns.find((c) => c.primary) ?? columns[0]
  const rest = columns.filter((c) => c.id !== primary?.id)

  return {
    title: (row) => (primary ? primary.render(row) : '—'),
    fields: rest.map((col) => ({
      id: col.id,
      label: col.label,
      render: col.render,
    })),
  }
}

/** Build card layout from generic list columns + Airtable records. */
export function cardLayoutFromListColumns(
  columns: readonly { field: string; label: string }[],
  primaryField?: string,
): RecordCardLayout<NormalizedRecord<Record<string, unknown>>> {
  const primary =
    columns.find((c) => c.field === primaryField) ?? columns[0]
  const rest = columns.filter((c) => c.field !== primary?.field)

  const renderField =
    (field: string): ((row: NormalizedRecord<Record<string, unknown>>) => ReactNode) =>
    (row) =>
      formatCellValue(row.fields[field])

  return {
    title: primary
      ? (row) => renderField(primary.field)(row)
      : () => '—',
    fields: rest.map((col) => ({
      id: col.field,
      label: col.label,
      render: renderField(col.field),
    })),
  }
}
