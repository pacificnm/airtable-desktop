import { useContext } from 'react'
import {
  AirtableContext,
  type AirtableContextValue,
} from '../context/airtableContext.ts'

export type {
  AirtableAuthMode,
  AirtableContextValue,
  PatSource,
} from '../context/airtableContext.ts'

export function useAirtable(): AirtableContextValue {
  const ctx = useContext(AirtableContext)
  if (!ctx) {
    throw new Error('useAirtable must be used within <AirtableProvider>')
  }
  return ctx
}
