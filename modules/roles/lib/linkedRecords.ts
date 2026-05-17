/** Airtable record id (linked-field cells often return these as plain strings). */
export function isAirtableRecordId(value: string): boolean {
  return /^rec[A-Za-z0-9]+$/.test(value.trim())
}

/** Airtable linked-record cell values (read). */
export function parseLinkedRecordIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (typeof item === 'string' && item.startsWith('rec')) return item
      if (item && typeof item === 'object' && 'id' in item) {
        return String((item as { id: string }).id)
      }
      return null
    })
    .filter((id): id is string => Boolean(id))
}

/** Display names from linked cells when Airtable includes them (not plain record ids). */
export function parseLinkedRecordNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (item && typeof item === 'object' && 'name' in item) {
        const name = String((item as { name?: string }).name ?? '').trim()
        if (name && !isAirtableRecordId(name)) return name
      }
      return ''
    })
    .filter(Boolean)
}

/** Resolve linked record ids to labels using a local id → name map (e.g. from Roles table). */
export function resolveLinkedRecordLabels(
  recordIds: readonly string[],
  nameById: ReadonlyMap<string, string>,
): string[] {
  return recordIds.map((id) => nameById.get(id) ?? '').filter(Boolean)
}

/** Write payload for a linked-record field (single or multi). */
export function linkedRecordIdsForWrite(
  roleId: string | null | undefined,
): string[] | undefined {
  const id = roleId?.trim()
  if (!id) return undefined
  return [id]
}
