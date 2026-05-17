import type { MetaTableSchema } from '../metaTypes.ts'

/** Minimal Meta API table shape for codegen / Zod tests. */
export const sampleMetaTable: MetaTableSchema = {
  id: 'tblSample',
  name: 'Work Items',
  primaryFieldId: 'fldTitle',
  views: [{ id: 'viw1', name: 'Grid', type: 'grid' }],
  fields: [
    { id: 'fldTitle', name: 'Title', type: 'singleLineText' },
    {
      id: 'fldStatus',
      name: 'Status',
      type: 'singleSelect',
      options: {
        choices: [{ name: 'Open' }, { name: 'Done' }],
      },
    },
    { id: 'fldDone', name: 'Done', type: 'checkbox' },
    { id: 'fldFormula', name: 'Computed', type: 'formula' },
  ],
}
