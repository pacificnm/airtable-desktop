import {
  DataTableText,
  LabelChip,
  StatusChip,
  type DataTableColumn,
} from '../../../src/components/ui/index.ts'
import type { ConfigEntry } from './configFromRecords.ts'
import { formatConfigValueForForm } from './configForm.ts'

function displayValue(entry: ConfigEntry): string {
  const text = formatConfigValueForForm(entry.value, entry.valueType)
  if (text.length > 80) return `${text.slice(0, 77)}…`
  return text
}

export function configListColumns(): DataTableColumn<ConfigEntry>[] {
  return [
    {
      id: 'key',
      label: 'Key',
      primary: true,
      maxWidth: 220,
      render: (entry) => (
        <DataTableText title={entry.key}>{entry.key}</DataTableText>
      ),
    },
    {
      id: 'value',
      label: 'Value',
      render: (entry) => (
        <DataTableText title={formatConfigValueForForm(entry.value, entry.valueType)}>
          {displayValue(entry)}
        </DataTableText>
      ),
    },
    {
      id: 'valueType',
      label: 'Type',
      render: (entry) => <LabelChip label={entry.valueType} />,
    },
    {
      id: 'module',
      label: 'Module',
      render: (entry) => (
        <DataTableText secondary>{entry.module ?? '—'}</DataTableText>
      ),
    },
    {
      id: 'active',
      label: 'Active',
      render: (entry) => <StatusChip active={entry.active} />,
    },
  ]
}
