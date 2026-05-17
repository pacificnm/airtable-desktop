import { LabelChip, StatusChip } from '../../../src/components/ui/index.ts'
import type { RecordCardLayout } from '../../../src/components/ui/record/recordTypes.ts'
import type { ConfigEntry } from './configFromRecords.ts'
import { formatConfigValueForForm } from './configForm.ts'

export function configCardLayout(): RecordCardLayout<ConfigEntry> {
  return {
    title: (entry) => entry.key,
    subtitle: (entry) => formatConfigValueForForm(entry.value, entry.valueType),
    fields: [
      {
        id: 'valueType',
        label: 'Type',
        render: (entry) => <LabelChip label={entry.valueType} />,
      },
      {
        id: 'module',
        label: 'Module',
        render: (entry) => entry.module ?? '—',
      },
    ],
    footer: (entry) => <StatusChip active={entry.active} />,
  }
}
