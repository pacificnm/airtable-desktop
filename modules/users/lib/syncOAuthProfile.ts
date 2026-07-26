import type { AirtableClient } from '../../../src/lib/airtable/airtableClient.ts'
import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import type { WhoamiResponse } from '../../../src/lib/airtable/types.ts'
import { escapeAirtableFormulaString } from './airtableFormula.ts'
import { mapConfigToAirtableFields } from '../../../src/lib/airtable/mapRecordFields.ts'

/**
 * Upsert an App Users row linked to the current Airtable OAuth user id.
 */
export async function syncOAuthUserProfile(
  client: AirtableClient,
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

  if (existing.records[0]) {
    // `active` and `displayName` are admin-editable in AppUserForm — don't re-sync them here,
    // or an admin's deactivation/rename gets silently overwritten on the user's next sign-in.
    // Only keep the OAuth link fresh (id + email).
    const id = existing.records[0].id
    const fields = mapConfigToAirtableFields(tableConfig, {
      email: email || undefined,
      airtableUserId,
    })
    await client.updateRecords(tableConfig.tableId, [{ id, fields }])
    return { recordId: id, created: false }
  }

  const fields = mapConfigToAirtableFields(tableConfig, {
    email: email || undefined,
    displayName,
    airtableUserId,
    active: true,
  })
  const created = await client.createRecords(tableConfig.tableId, [{ fields }])
  return { recordId: created.records[0]!.id, created: true }
}
