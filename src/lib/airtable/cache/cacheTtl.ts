/** How long cached reads stay valid before refetching Airtable. */
export const CACHE_TTL_MS = {
  /** Base schema (tables, fields, select colors). */
  schema: 24 * 60 * 60 * 1000,
  /** Table list queries (buildings list, formula batches). */
  list: 10 * 60 * 1000,
  /** Single record by id. */
  record: 60 * 60 * 1000,
  /** Linked record id → display label (merged per linked table). */
  linkedLabels: 24 * 60 * 60 * 1000,
} as const
