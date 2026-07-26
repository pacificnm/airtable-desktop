import type { MetaFieldSnapshot } from '@/config/tableTypes.ts'

/**
 * Full field metadata from Airtable Meta API (types, select colors, link targets, etc.).
 * Regenerate via Developer → Modules → Sync schema from Airtable.
 * @see https://airtable.com/developers/web/api/field-model
 */
export const configModuleFieldsMeta: Record<string, readonly MetaFieldSnapshot[]> = {
  'appConfig': [
    {
      id: 'fldhG6iN6l62xsNvM',
      configKey: 'active',
      name: 'Active',
      type: 'checkbox',
      options: {
          "icon": "check",
          "color": "greenBright"
        },
    },
    {
      id: 'fld9bGNm8Juucebpq',
      configKey: 'description',
      name: 'Description',
      type: 'multilineText',
      options: undefined,
    },
    {
      id: 'fldzPzAvQ2zuxP28u',
      configKey: 'key',
      name: 'Key',
      type: 'singleLineText',
      options: undefined,
    },
    {
      id: 'fld3BXm2TZMw4OTET',
      configKey: 'label',
      name: 'Label',
      type: 'singleLineText',
      options: undefined,
    },
    {
      id: 'fldHYeWFtaShrhTmQ',
      configKey: 'module',
      name: 'Module',
      type: 'singleLineText',
      options: undefined,
    },
    {
      id: 'fldn1xEfF8dbG7i7R',
      configKey: 'value',
      name: 'Value',
      type: 'multilineText',
      options: undefined,
    },
    {
      id: 'fldJQl9yEMaLskQD9',
      configKey: 'valueType',
      name: 'Value type',
      type: 'singleSelect',
      options: {
          "choices": [
            {
              "id": "sel51S0FCyc65RBYm",
              "name": "string",
              "color": "grayLight2"
            },
            {
              "id": "selz8qGlz32Yc0YsP",
              "name": "number",
              "color": "grayLight2"
            },
            {
              "id": "selnJjvLanezdRE0L",
              "name": "boolean",
              "color": "grayLight2"
            },
            {
              "id": "sel7HgdPzWZWig9ng",
              "name": "json",
              "color": "grayLight2"
            }
          ]
        },
    },
  ],
}
