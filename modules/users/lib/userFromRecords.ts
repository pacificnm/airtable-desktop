import type { NormalizedRecord } from '../../../src/lib/airtable/mapRecordFields.ts'
import {
  parseLinkedRecordIds,
  parseLinkedRecordNames,
} from '../../roles/lib/linkedRecords.ts'

export interface AppUserRecord {
  id: string
  email: string
  displayName: string
  username?: string
  airtableUserId?: string
  roleIds: string[]
  roleNames: string[]
  active: boolean
  notes?: string
  /** Present in API data; never show in UI lists. */
  hasPassword: boolean
}

type AppUserFields = {
  email?: string
  displayName?: string
  username?: string
  airtableUserId?: string
  passwordHash?: unknown
  role?: unknown
  active?: unknown
  notes?: string
}

function parseActive(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true
  if (typeof raw === 'boolean') return raw
  return String(raw).toLowerCase() === 'true'
}

export function recordToAppUser(
  record: NormalizedRecord<AppUserFields>,
): AppUserRecord | null {
  const email = record.fields.email?.trim() ?? ''
  const displayName =
    record.fields.displayName?.trim() ||
    record.fields.email?.trim() ||
    record.fields.username?.trim() ||
    ''
  if (!email && !displayName && !record.fields.username?.trim()) return null

  const roleIds = parseLinkedRecordIds(record.fields.role)
  const roleNames = parseLinkedRecordNames(record.fields.role)
  const passwordHash = record.fields.passwordHash

  return {
    id: record.id,
    email,
    displayName: displayName || email || 'User',
    username: record.fields.username?.trim() || undefined,
    airtableUserId: record.fields.airtableUserId?.trim() || undefined,
    roleIds,
    roleNames,
    active: parseActive(record.fields.active),
    notes: record.fields.notes?.trim() || undefined,
    hasPassword: typeof passwordHash === 'string' && passwordHash.length > 0,
  }
}

export function appUsersFromRecords(
  records: readonly NormalizedRecord<AppUserFields>[],
): AppUserRecord[] {
  return records
    .map(recordToAppUser)
    .filter((u): u is AppUserRecord => u != null)
}
