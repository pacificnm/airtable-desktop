import type { MetaFieldSnapshot } from '../../config/tableTypes.ts'
import type { MetaFieldSchema, MetaTableSchema } from './metaTypes.ts'
import { parseSelectChoices, type SelectChoice } from './fieldOptions.ts'

/** Live Meta API table + config key → field definition. */
export function getFieldByConfigKey(
  table: MetaTableSchema,
  configKey: string,
  fieldsMap: Record<string, string>,
): MetaFieldSchema | undefined {
  const airtableName = fieldsMap[configKey]
  if (airtableName) {
    const byName = table.fields.find((f) => f.name === airtableName)
    if (byName) return byName
  }
  return table.fields.find(
    (f) =>
      f.name.localeCompare(configKey, undefined, { sensitivity: 'accent' }) === 0,
  )
}

/** Synced `tables.meta.ts` snapshot + config key. */
export function getFieldSnapshotByConfigKey(
  snapshots: readonly MetaFieldSnapshot[] | undefined,
  configKey: string,
): MetaFieldSnapshot | undefined {
  return snapshots?.find((f) => f.configKey === configKey)
}

export function getSelectChoicesForConfigKey(
  table: MetaTableSchema | undefined,
  snapshots: readonly MetaFieldSnapshot[] | undefined,
  configKey: string,
  fieldsMap: Record<string, string>,
): SelectChoice[] {
  const live = table ? getFieldByConfigKey(table, configKey, fieldsMap) : undefined
  if (live) return parseSelectChoices(live)

  const snap = getFieldSnapshotByConfigKey(snapshots, configKey)
  if (!snap?.options?.choices || !Array.isArray(snap.options.choices)) return []
  return parseSelectChoices({
    id: snap.id,
    name: snap.name,
    type: snap.type,
    options: snap.options,
  })
}
