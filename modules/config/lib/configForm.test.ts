import { describe, expect, it } from 'vitest'
import {
  configEntryToFormValues,
  configFormValuesToAirtableFields,
  formatConfigValueForForm,
  validateConfigFormValues,
} from './configForm.ts'
import type { ConfigEntry } from './configFromRecords.ts'
import { getAppConfigTableConfig } from '../validation/config.ts'

const config = getAppConfigTableConfig()!

describe('formatConfigValueForForm', () => {
  it('formats json objects', () => {
    expect(formatConfigValueForForm({ a: 1 }, 'json')).toBe(
      '{\n  "a": 1\n}',
    )
  })

  it('formats booleans', () => {
    expect(formatConfigValueForForm(true, 'boolean')).toBe('true')
  })
})

describe('configFormValuesToAirtableFields', () => {
  it('maps to Airtable field names', () => {
    expect(
      configFormValuesToAirtableFields(config, {
        key: 'app.name',
        value: 'Demo',
        valueType: 'string',
        label: 'Name',
        description: '',
        module: 'config',
        active: true,
      }),
    ).toEqual({
      Key: 'app.name',
      Value: 'Demo',
      'Value type': 'string',
      Label: 'Name',
      Module: 'config',
      Active: true,
    })
  })
})

describe('validateConfigFormValues', () => {
  it('requires key', () => {
    expect(
      validateConfigFormValues({
        key: '  ',
        value: '',
        valueType: 'string',
        label: '',
        description: '',
        module: '',
        active: true,
      }),
    ).toBe('Key is required.')
  })

  it('validates json', () => {
    expect(
      validateConfigFormValues({
        key: 'x',
        value: '{bad',
        valueType: 'json',
        label: '',
        description: '',
        module: '',
        active: true,
      }),
    ).toMatch(/valid JSON/)
  })
})

describe('configEntryToFormValues', () => {
  it('round-trips entry fields', () => {
    const entry: ConfigEntry = {
      id: 'rec1',
      key: 'module.roles.enabled',
      value: true,
      valueType: 'boolean',
      active: true,
    }
    expect(configEntryToFormValues(entry).value).toBe('true')
  })
})
