import type { ListRecordsQuery } from '../types.ts'

function stableQueryPart(query: ListRecordsQuery): string {
  const sort = query.sort
    ?.map((s) => `${s.field}:${s.direction ?? 'asc'}`)
    .join('|')
  const parts = [
    query.pageSize != null ? `ps=${query.pageSize}` : '',
    query.maxRecords != null ? `mr=${query.maxRecords}` : '',
    query.offset ? `off=${query.offset}` : '',
    query.view ? `v=${query.view}` : '',
    query.filterByFormula ? `f=${query.filterByFormula}` : '',
    sort ? `s=${sort}` : '',
  ].filter(Boolean)
  return parts.join('&') || 'default'
}

export function schemaCacheKey(): string {
  return 'schema'
}

export function listCacheKey(tableId: string, query: ListRecordsQuery = {}): string {
  return `list:${tableId}:${stableQueryPart(query)}`
}

export function recordCacheKey(tableId: string, recordId: string): string {
  return `record:${tableId}:${recordId}`
}

export function linkedLabelsCacheKey(
  linkedTableId: string,
  labelFieldNames: readonly string[],
): string {
  return `linkedLabels:${linkedTableId}:${labelFieldNames.join('\u0001')}`
}
