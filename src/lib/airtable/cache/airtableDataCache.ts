import { CACHE_TTL_MS } from './cacheTtl.ts'
import {
  linkedLabelsCacheKey,
  listCacheKey,
  recordCacheKey,
  schemaCacheKey,
} from './cacheKeys.ts'
import type { ListRecordsQuery } from '../types.ts'
import type { BaseSchemaResponse } from '../metaTypes.ts'
import type { ListRecordsResponse } from '../types.ts'
import type { AirtableRecord } from '../types.ts'

const STORAGE_VERSION = 1
const STORAGE_PREFIX = 'airtable.dataCache.v1.'
const MAX_ENTRIES_PER_BASE = 400

interface CacheEntry {
  expiresAt: number
  data: unknown
}

interface PersistedBaseCache {
  v: number
  entries: Record<string, CacheEntry>
}

function storageKeyForBase(baseId: string): string {
  return `${STORAGE_PREFIX}${baseId}`
}

function isExpired(entry: CacheEntry, now = Date.now()): boolean {
  return entry.expiresAt <= now
}

export class AirtableDataCache {
  readonly baseId: string
  private readonly memory = new Map<string, CacheEntry>()
  private persistTimer: ReturnType<typeof setTimeout> | undefined

  constructor(baseId: string) {
    this.baseId = baseId
    this.hydrateFromStorage()
  }

  private hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') return
    try {
      const raw = localStorage.getItem(storageKeyForBase(this.baseId))
      if (!raw) return
      const parsed = JSON.parse(raw) as PersistedBaseCache
      if (parsed.v !== STORAGE_VERSION || !parsed.entries) return
      const now = Date.now()
      for (const [key, entry] of Object.entries(parsed.entries)) {
        if (!isExpired(entry, now)) {
          this.memory.set(key, entry)
        }
      }
    } catch {
      /* ignore corrupt cache */
    }
  }

  private schedulePersist(): void {
    if (typeof localStorage === 'undefined') return
    if (this.persistTimer) clearTimeout(this.persistTimer)
    this.persistTimer = setTimeout(() => this.persistNow(), 250)
  }

  private persistNow(): void {
    if (typeof localStorage === 'undefined') return
    try {
      this.prune()
      const entries: Record<string, CacheEntry> = {}
      for (const [key, entry] of this.memory) {
        entries[key] = entry
      }
      const payload: PersistedBaseCache = { v: STORAGE_VERSION, entries }
      localStorage.setItem(
        storageKeyForBase(this.baseId),
        JSON.stringify(payload),
      )
    } catch {
      /* quota exceeded — drop persisted cache for this base */
      try {
        localStorage.removeItem(storageKeyForBase(this.baseId))
      } catch {
        /* ignore */
      }
    }
  }

  private prune(now = Date.now()): void {
    for (const [key, entry] of this.memory) {
      if (isExpired(entry, now)) this.memory.delete(key)
    }
    if (this.memory.size <= MAX_ENTRIES_PER_BASE) return
    const sorted = [...this.memory.entries()].sort(
      (a, b) => a[1].expiresAt - b[1].expiresAt,
    )
    const removeCount = this.memory.size - MAX_ENTRIES_PER_BASE
    for (let i = 0; i < removeCount; i++) {
      this.memory.delete(sorted[i]![0])
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.memory.get(key)
    if (!entry) return undefined
    if (isExpired(entry)) {
      this.memory.delete(key)
      return undefined
    }
    return entry.data as T
  }

  set(key: string, data: unknown, ttlMs: number): void {
    this.memory.set(key, { data, expiresAt: Date.now() + ttlMs })
    this.schedulePersist()
  }

  delete(key: string): void {
    if (this.memory.delete(key)) this.schedulePersist()
  }

  clear(): void {
    this.memory.clear()
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(storageKeyForBase(this.baseId))
      } catch {
        /* ignore */
      }
    }
  }

  /** Drop list + record entries for one table (after mutations). */
  clearTable(tableId: string): void {
    const prefixes = [`list:${tableId}:`, `record:${tableId}:`, `linkedLabels:${tableId}:`]
    for (const key of [...this.memory.keys()]) {
      if (prefixes.some((p) => key.startsWith(p))) {
        this.memory.delete(key)
      }
    }
    this.schedulePersist()
  }

  getSchema(): BaseSchemaResponse | undefined {
    return this.get<BaseSchemaResponse>(schemaCacheKey())
  }

  setSchema(schema: BaseSchemaResponse): void {
    this.set(schemaCacheKey(), schema, CACHE_TTL_MS.schema)
  }

  getList<TFields = Record<string, unknown>>(
    tableId: string,
    query: ListRecordsQuery,
  ): ListRecordsResponse<TFields> | undefined {
    return this.get<ListRecordsResponse<TFields>>(listCacheKey(tableId, query))
  }

  setList<TFields = Record<string, unknown>>(
    tableId: string,
    query: ListRecordsQuery,
    response: ListRecordsResponse<TFields>,
  ): void {
    this.set(listCacheKey(tableId, query), response, CACHE_TTL_MS.list)
  }

  getRecord<TFields = Record<string, unknown>>(
    tableId: string,
    recordId: string,
  ): AirtableRecord<TFields> | undefined {
    return this.get<AirtableRecord<TFields>>(recordCacheKey(tableId, recordId))
  }

  setRecord<TFields = Record<string, unknown>>(
    tableId: string,
    recordId: string,
    record: AirtableRecord<TFields>,
  ): void {
    this.set(recordCacheKey(tableId, recordId), record, CACHE_TTL_MS.record)
  }

  getLinkedLabels(
    linkedTableId: string,
    labelFieldNames: readonly string[],
  ): Record<string, string> {
    const key = linkedLabelsCacheKey(linkedTableId, labelFieldNames)
    return this.get<Record<string, string>>(key) ?? {}
  }

  mergeLinkedLabels(
    linkedTableId: string,
    labelFieldNames: readonly string[],
    labels: ReadonlyMap<string, string> | Record<string, string>,
  ): void {
    const key = linkedLabelsCacheKey(linkedTableId, labelFieldNames)
    const existing = this.getLinkedLabels(linkedTableId, labelFieldNames)
    const merged = { ...existing }
    if (labels instanceof Map) {
      for (const [id, label] of labels) {
        if (label) merged[id] = label
      }
    } else {
      Object.assign(merged, labels)
    }
    this.set(key, merged, CACHE_TTL_MS.linkedLabels)
  }
}

const cacheByBase = new Map<string, AirtableDataCache>()

export function getAirtableDataCache(baseId: string): AirtableDataCache {
  let cache = cacheByBase.get(baseId)
  if (!cache) {
    cache = new AirtableDataCache(baseId)
    cacheByBase.set(baseId, cache)
  }
  return cache
}

export function clearAirtableDataCache(baseId?: string): void {
  if (baseId) {
    cacheByBase.get(baseId)?.clear()
    cacheByBase.delete(baseId)
    return
  }
  for (const cache of cacheByBase.values()) cache.clear()
  cacheByBase.clear()
}

export function clearAirtableTableCache(baseId: string, tableId: string): void {
  getAirtableDataCache(baseId).clearTable(tableId)
}
