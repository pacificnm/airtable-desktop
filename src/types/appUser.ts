import type { AirtableAuthMode } from '../context/airtableContext.ts'

export interface AppUser {
  displayName: string
  subtitle?: string
  email?: string
  userId?: string
  authMode: AirtableAuthMode
  baseId?: string
}
