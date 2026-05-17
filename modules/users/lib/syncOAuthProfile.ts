import type { AirtableRestClient } from '../../../src/lib/airtable/restClient.ts'
import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import type { WhoamiResponse } from '../../../src/lib/airtable/types.ts'
import { escapeAirtableFormulaString } from './airtableFormula.ts'
import { mapConfigToAirtableFields } from '../../../src/lib/airtable/mapRecordFields.ts'

/**
 * Upsert an App Users row linked to the current Airtable OAuth user id.
 */
export async function syncOAuthUserProfile(
  client: AirtableRestClient,
  tableConfig: AirtableTableConfig,
  whoami: WhoamiResponse,
): Promise<{ recordId: string; created: boolean }> {
  const airtableUserId = whoami.id.trim()
  const email = whoami.email?.trim() ?? ''
  const displayName = email ? email.split('@')[0] ?? 'User' : 'Airtable user'

  const idField = tableConfig.fields.airtableUserId ?? 'Airtable user id'
  const formula = `{${idField}}='${escapeAirtableFormulaString(airtableUserId)}'`

  const existing = await client.listRecords<Record<string, unknown>>(
    tableConfig.tableId,
    { filterByFormula: formula, maxRecords: 1 },
  )

  const fields = mapConfigToAirtableFields(tableConfig, {
    email: email || undefined,
    displayName,
    airtableUserId,
    active: true,
  })

  if (existing.records[0]) {
    const id = existing.records[0].id
    await client.updateRecords(tableConfig.tableId, [{ id, fields }])
    return { recordId: id, created: false }
  }

  const created = await client.createRecords(tableConfig.tableId, [{ fields }])
  return { recordId: created.records[0]!.id, created: true }
}
