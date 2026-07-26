import type { ModuleFieldBlueprint } from './tableBlueprints.ts'

export interface CreateTableFieldPayload {
  name: string
  type: string
  description?: string
  options?: Record<string, unknown>
}

export function buildCreateTableFields(
  fields: readonly ModuleFieldBlueprint[],
  linkedTableIds: Readonly<Record<string, string>>,
): CreateTableFieldPayload[] {
  return fields.map((field) => {
    const payload: CreateTableFieldPayload = {
      name: field.name,
      type: field.type,
    }
    if (field.description) payload.description = field.description

    if (field.type === 'multipleRecordLinks' && field.linkToTableKey) {
      const linkedTableId = linkedTableIds[field.linkToTableKey]
      if (!linkedTableId) {
        throw new Error(
          `Cannot create link field "${field.name}": table key "${field.linkToTableKey}" was not found. ` +
            'Enable dependency modules first (config → roles → users) so table ids are stored in App Config.',
        )
      }
      // Airtable create-table API only accepts linkedTableId here (not prefersSingleRecordLink / isReversed).
      payload.options = { linkedTableId }
    } else if (field.options) {
      payload.options = field.options
    }

    return payload
  })
}

/** Tables with link fields should be created after their targets. */
export function sortBlueprintsForProvisioning<
  T extends { fields: readonly ModuleFieldBlueprint[] },
>(blueprints: readonly T[]): T[] {
  const remaining = [...blueprints]
  const sorted: T[] = []
  const keys = new Set(remaining.map((b) => (b as { tableKey?: string }).tableKey))

  // Each iteration either removes exactly one entry from `remaining` or breaks,
  // so this always terminates in at most `blueprints.length` passes — no guard needed.
  while (remaining.length > 0) {
    const nextIndex = remaining.findIndex((bp) =>
      bp.fields.every((f) => {
        if (!f.linkToTableKey) return true
        const depKey = f.linkToTableKey
        if (!keys.has(depKey)) return true
        return sorted.some(
          (s) => (s as { tableKey?: string }).tableKey === depKey,
        )
      }),
    )
    if (nextIndex < 0) {
      sorted.push(...remaining)
      break
    }
    sorted.push(remaining.splice(nextIndex, 1)[0]!)
  }
  return sorted
}
