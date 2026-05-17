import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { sampleMetaTable } from './__fixtures__/sampleMetaTable.ts'
import { buildTableZodObject } from './inferZodFromField.ts'
import { generateZodSchemaSnippet } from './generateZodSchemaSnippet.ts'

describe('generateZodSchemaSnippet', () => {
  it('emits create, patch, and record schemas with config keys', () => {
    const snippet = generateZodSchemaSnippet(sampleMetaTable)

    expect(snippet).toContain('workItemsCreateSchema')
    expect(snippet).toContain('workItemsPatchSchema')
    expect(snippet).toContain('workItemsRecordSchema')
    expect(snippet).toContain('title: z.string().min(1)')
    expect(snippet).toContain('status: z.enum(["Open", "Done"])')
    expect(snippet).toMatch(/done: z\.boolean\(\)\.optional\(\)/)
    expect(snippet).toContain('formula · Computed')
    const createBlock = snippet.slice(
      snippet.indexOf('workItemsCreateSchema'),
      snippet.indexOf('workItemsPatchSchema'),
    )
    expect(createBlock).not.toContain('computed:')
  })

  it('respects config key override', () => {
    const snippet = generateZodSchemaSnippet(sampleMetaTable, {
      key: 'tasks',
    })
    expect(snippet).toContain('tasksCreateSchema')
    expect(snippet).not.toContain('workItemsCreateSchema')
  })
})

describe('buildTableZodObject', () => {
  it('requires primary field on create and omits read-only fields', () => {
    const createSchema = buildTableZodObject(sampleMetaTable, 'create')

    expect(createSchema.safeParse({}).success).toBe(false)
    expect(createSchema.safeParse({ title: '' }).success).toBe(false)
    expect(
      createSchema.safeParse({ title: 'Ship feature', status: 'Open' }).success,
    ).toBe(true)
    expect(Object.keys(createSchema.shape)).not.toContain('computed')
  })

  it('allows partial patch updates', () => {
    const patchSchema = buildTableZodObject(sampleMetaTable, 'patch')
    expect(patchSchema.safeParse({ done: true }).success).toBe(true)
    expect(patchSchema.safeParse({}).success).toBe(true)
  })

  it('includes read-only fields on record shape', () => {
    const recordSchema = buildTableZodObject(sampleMetaTable, 'record')
    expect(Object.keys(recordSchema.shape)).toContain('computed')
  })

  it('honors app-level required overrides on create', () => {
    const schema = buildTableZodObject(sampleMetaTable, 'create', {
      status: { required: true },
    })
    expect(schema.safeParse({ title: 'x' }).success).toBe(false)
    expect(schema.safeParse({ title: 'x', status: 'Open' }).success).toBe(true)
  })
})

/** Sanity: generated enum strings are valid Zod when evaluated (paste flow). */
describe('generated snippet shape', () => {
  it('record schema accepts typical API payload keys', () => {
    const recordSchema = buildTableZodObject(sampleMetaTable, 'record')
    const parsed = recordSchema.safeParse({
      title: 'Item',
      status: 'Done',
      done: true,
      computed: 42,
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.status).toBe('Done')
    }
  })

  it('rejects invalid select values', () => {
    const createSchema = buildTableZodObject(sampleMetaTable, 'create')
    const parsed = createSchema.safeParse({
      title: 'Item',
      status: 'Invalid',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error).toBeInstanceOf(z.ZodError)
    }
  })
})
