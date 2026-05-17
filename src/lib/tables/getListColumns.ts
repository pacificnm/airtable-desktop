import type { AirtableTableConfig, TableColumnConfig } from '../../config/tables.ts'

export interface ListColumnDef {
  field: string
  label: string
}

function humanizeField(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function fromColumnConfig(col: TableColumnConfig): ListColumnDef {
  return {
    field: col.field,
    label: col.label ?? humanizeField(col.field),
  }
}

/** Visible columns for list UIs — uses `columns` or falls back to `fields` keys. */
export function getListColumns(config: AirtableTableConfig): ListColumnDef[] {
  let columns: ListColumnDef[]

  if (config.columns?.length) {
    columns = config.columns.filter((c) => !c.hidden).map(fromColumnConfig)
  } else {
    columns = Object.keys(config.fields).map((field) => ({
      field,
      label: humanizeField(field),
    }))
  }

  const primary = config.primaryField
  if (primary && columns.some((c) => c.field === primary)) {
    const primaryCol = columns.find((c) => c.field === primary)!
    return [primaryCol, ...columns.filter((c) => c.field !== primary)]
  }

  return columns
}
