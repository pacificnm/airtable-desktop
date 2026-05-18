import { describe, expect, it } from 'vitest'
import { formatSelectChoicesSummary, parseSelectChoices } from './fieldOptions.ts'
import type { MetaFieldSchema } from './metaTypes.ts'

const statusField: MetaFieldSchema = {
  id: 'fldStatus',
  name: 'Status',
  type: 'singleSelect',
  options: {
    choices: [
      { id: 'sel1', name: 'Active', color: 'greenBright' },
      { id: 'sel2', name: 'Inactive', color: 'grayBright' },
    ],
  },
}

describe('parseSelectChoices', () => {
  it('includes id, name, and color', () => {
    expect(parseSelectChoices(statusField)).toEqual([
      { id: 'sel1', name: 'Active', color: 'greenBright' },
      { id: 'sel2', name: 'Inactive', color: 'grayBright' },
    ])
  })

  it('summarizes with colors', () => {
    expect(formatSelectChoicesSummary(statusField)).toBe(
      'Active (greenBright), Inactive (grayBright)',
    )
  })
})
