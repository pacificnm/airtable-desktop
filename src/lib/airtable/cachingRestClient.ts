import type { AirtableClient } from './airtableClient.ts'
import { AirtableApiError } from './errors.ts'
import type { BaseSchemaResponse, MetaTableSchema } from './metaTypes.ts'
import { AirtableRestClient } from './restClient.ts'
import type {
  AirtableRecord,
  ListAllRecordsOptions,
  ListAllRecordsResult,
  ListRecordsQuery,
  ListRecordsResponse,
  WhoamiResponse,
} from './types.ts'
import {
  AirtableDataCache,
  clearAirtableTableCache,
  getAirtableDataCache,
} from './cache/airtableDataCache.ts'

/**
 * Wraps {@link AirtableRestClient} with persistent local cache (localStorage + memory).
 * Caches schema, list, and single-record reads. Mutations invalidate the affected table.
 */
export class CachingAirtableRestClient implements AirtableClient {
  readonly dataCache: AirtableDataCache
  private readonly inner: AirtableRestClient

  constructor(inner: AirtableRestClient) {
    this.inner = inner
    this.dataCache = getAirtableDataCache(inner.baseId)
  }

  get baseId(): string {
    return this.inner.baseId
  }

  async listRecords<TFields = Record<string, unknown>>(
    table: string,
    query: ListRecordsQuery = {},
  ): Promise<ListRecordsResponse<TFields>> {
    const cached = this.dataCache.getList<TFields>(table, query)
    if (cached) return cached

    const response = await this.inner.listRecords<TFields>(table, query)
    this.dataCache.setList(table, query, response)
    return response
  }

  async getRecord<TFields = Record<string, unknown>>(
    tableId: string,
    recordId: string,
  ): Promise<AirtableRecord<TFields>> {
    const cached = this.dataCache.getRecord<TFields>(tableId, recordId)
    if (cached) return cached

    const record = await this.inner.getRecord<TFields>(tableId, recordId)
    this.dataCache.setRecord(tableId, recordId, record)
    return record
  }

  async retrieveRecord<TFields = Record<string, unknown>>(
    table: string,
    recordId: string,
  ): Promise<AirtableRecord<TFields>> {
    return this.getRecord<TFields>(table, recordId)
  }

  async getBaseSchema(): Promise<BaseSchemaResponse> {
    const cached = this.dataCache.getSchema()
    if (cached) return cached

    const schema = await this.inner.getBaseSchema()
    this.dataCache.setSchema(schema)
    return schema
  }

  async listAllRecords<TFields = Record<string, unknown>>(
    table: string,
    options: ListAllRecordsOptions = {},
  ): Promise<ListAllRecordsResult<TFields>> {
    return this.inner.listAllRecords<TFields>(table, options)
  }

  async createRecords<TFields = Record<string, unknown>>(
    table: string,
    records: { fields: TFields }[],
  ): Promise<{ records: AirtableRecord<TFields>[] }> {
    const result = await this.inner.createRecords(table, records)
    clearAirtableTableCache(this.baseId, table)
    return result
  }

  async updateRecords<TFields = Record<string, unknown>>(
    table: string,
    records: { id: string; fields: Partial<TFields> }[],
    destructive = false,
  ): Promise<{ records: AirtableRecord<TFields>[] }> {
    const result = await this.inner.updateRecords(table, records, destructive)
    clearAirtableTableCache(this.baseId, table)
    return result
  }

  async deleteRecords(
    table: string,
    recordIds: string[],
  ): Promise<{ records: { id: string; deleted: boolean }[] }> {
    const result = await this.inner.deleteRecords(table, recordIds)
    clearAirtableTableCache(this.baseId, table)
    return result
  }

  async createTable(body: {
    name: string
    fields: {
      name: string
      type: string
      description?: string
      options?: Record<string, unknown>
    }[]
    description?: string
  }): Promise<MetaTableSchema> {
    const created = await this.inner.createTable(body)
    this.dataCache.delete('schema')
    return created
  }

  async whoami(): Promise<WhoamiResponse> {
    return this.inner.whoami()
  }

  async findTableById(tableId: string): Promise<MetaTableSchema> {
    const normalized = tableId.trim()
    const { tables } = await this.getBaseSchema()
    const table = tables.find((t) => t.id === normalized)
    if (!table) {
      throw new AirtableApiError(`No table found with id "${normalized}" in this base.`, {
        status: 404,
      })
    }
    return table
  }

  async uploadRecordAttachment(options: {
    recordId: string
    fieldName: string
    file: File | Blob
    filename?: string
    contentType?: string
  }): Promise<AirtableRecord<Record<string, unknown>>> {
    return this.inner.uploadRecordAttachment(options)
  }
}

export function createCachingAirtableClient(
  baseId: string,
  getAccessToken: () => string | null | Promise<string | null>,
): CachingAirtableRestClient {
  return new CachingAirtableRestClient(
    new AirtableRestClient({ baseId, getAccessToken }),
  )
}

export function getClientDataCache(
  client: AirtableClient,
): AirtableDataCache | undefined {
  return client instanceof CachingAirtableRestClient ? client.dataCache : undefined
}
