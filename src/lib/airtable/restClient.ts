import type {
  AirtableRecord,
  ListAllRecordsOptions,
  ListAllRecordsResult,
  ListRecordsQuery,
  ListRecordsResponse,
  WhoamiResponse,
} from './types.ts'
import type { BaseSchemaResponse, MetaTableSchema } from './metaTypes.ts'
import { AirtableApiError } from './errors.ts'
import { getAirtableApiRoot } from './apiBase.ts'
import { fetchWithRetry } from './fetchWithRetry.ts'

export interface AirtableRestClientOptions {
  baseId: string
  getAccessToken: () => string | null | Promise<string | null>
}

export class AirtableRestClient {
  private readonly options: AirtableRestClientOptions

  constructor(options: AirtableRestClientOptions) {
    this.options = options
  }

  private async authHeader(): Promise<HeadersInit> {
    const token = await this.requireAccessToken()
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  private async requireAccessToken(): Promise<string> {
    const token = await Promise.resolve(this.options.getAccessToken())
    if (!token?.trim()) {
      throw new AirtableApiError('Missing Airtable access token (PAT or OAuth).', {
        status: 401,
      })
    }
    return token.trim()
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    const text = await res.text()
    const body = text ? (JSON.parse(text) as unknown) : null
    if (!res.ok) {
      const msg =
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof (body as { error?: { message?: string } }).error?.message ===
          'string'
        ? (body as { error: { message: string } }).error.message
        : `Airtable API error (${res.status})`
      throw new AirtableApiError(msg, { status: res.status, body })
    }
    return body as T
  }

  private tablePath(table: string): string {
    return `${getAirtableApiRoot()}/${encodeURIComponent(this.options.baseId)}/${encodeURIComponent(table)}`
  }

  private fetchApi(url: string, init: RequestInit): Promise<Response> {
    return fetchWithRetry(url, init)
  }

  async listRecords<TFields = Record<string, unknown>>(
    table: string,
    query: ListRecordsQuery = {},
  ): Promise<ListRecordsResponse<TFields>> {
    const params = new URLSearchParams()
    if (query.pageSize != null)
      params.set('pageSize', String(query.pageSize))
    if (query.maxRecords != null)
      params.set('maxRecords', String(query.maxRecords))
    if (query.offset) params.set('offset', query.offset)
    if (query.view) params.set('view', query.view)
    if (query.filterByFormula)
      params.set('filterByFormula', query.filterByFormula)
    if (query.sort) {
      query.sort.forEach((s, i) => {
        params.set(`sort[${i}][field]`, s.field)
        if (s.direction) params.set(`sort[${i}][direction]`, s.direction)
      })
    }
    const qs = params.toString()
    const url = `${this.tablePath(table)}${qs ? `?${qs}` : ''}`
    const res = await this.fetchApi(url, { headers: await this.authHeader() })
    return this.parseResponse<ListRecordsResponse<TFields>>(res)
  }

  /**
   * Fetch all records by following Airtable `offset` tokens until exhausted.
   * Uses `pageSize` per request (max 100). Pass `maxTotal` or `maxPages` to cap.
   * @see https://airtable.com/developers/web/api/list-records
   */
  async listAllRecords<TFields = Record<string, unknown>>(
    table: string,
    options: ListAllRecordsOptions = {},
  ): Promise<ListAllRecordsResult<TFields>> {
    const {
      maxTotal: maxTotalOpt,
      maxPages = 1000,
      onPage,
      offset: _offset,
      maxRecords: maxRecordsCap,
      ...baseQuery
    } = options
    void _offset

    const maxTotal = maxTotalOpt ?? maxRecordsCap
    const pageSize = Math.min(baseQuery.pageSize ?? 100, 100)
    const records: AirtableRecord<TFields>[] = []
    let nextOffset: string | undefined
    let pageIndex = 0
    let truncated = false

    while (pageIndex < maxPages) {
      if (maxTotal != null && records.length >= maxTotal) {
        truncated = true
        break
      }

      const remaining =
        maxTotal != null ? maxTotal - records.length : undefined
      const page = await this.listRecords<TFields>(table, {
        ...baseQuery,
        pageSize:
          remaining != null ? Math.min(pageSize, remaining) : pageSize,
        offset: nextOffset,
      })

      records.push(...page.records)
      const hasMore = Boolean(page.offset)
      onPage?.({
        records: page.records as AirtableRecord[],
        pageIndex,
        hasMore,
      })

      if (!hasMore || page.records.length === 0) {
        break
      }

      nextOffset = page.offset
      pageIndex++

      if (maxTotal != null && records.length >= maxTotal) {
        truncated = true
        break
      }
    }

    if (pageIndex >= maxPages && nextOffset) {
      truncated = true
    }

    const finalRecords =
      maxTotal != null ? records.slice(0, maxTotal) : records

    return {
      records: finalRecords,
      truncated,
      pagesFetched: pageIndex + 1,
    }
  }

  async retrieveRecord<TFields = Record<string, unknown>>(
    table: string,
    recordId: string,
  ): Promise<AirtableRecord<TFields>> {
    const url = `${this.tablePath(table)}/${encodeURIComponent(recordId)}`
    const res = await this.fetchApi(url, { headers: await this.authHeader() })
    return this.parseResponse<AirtableRecord<TFields>>(res)
  }

  async createRecords<TFields = Record<string, unknown>>(
    table: string,
    records: { fields: TFields }[],
  ): Promise<{ records: AirtableRecord<TFields>[] }> {
    if (records.length > 10) {
      throw new AirtableApiError('createRecords accepts at most 10 rows per call.', {
        status: 400,
      })
    }
    const url = this.tablePath(table)
    const res = await this.fetchApi(url, {
      method: 'POST',
      headers: await this.authHeader(),
      body: JSON.stringify({ records }),
    })
    return this.parseResponse<{ records: AirtableRecord<TFields>[] }>(res)
  }

  async updateRecords<TFields = Record<string, unknown>>(
    table: string,
    records: { id: string; fields: Partial<TFields> }[],
    destructive = false,
  ): Promise<{ records: AirtableRecord<TFields>[] }> {
    if (records.length > 10) {
      throw new AirtableApiError('updateRecords accepts at most 10 rows per call.', {
        status: 400,
      })
    }
    const url = this.tablePath(table)
    const res = await this.fetchApi(url, {
      method: destructive ? 'PUT' : 'PATCH',
      headers: await this.authHeader(),
      body: JSON.stringify({ records }),
    })
    return this.parseResponse<{ records: AirtableRecord<TFields>[] }>(res)
  }

  /**
   * Base schema (tables, fields, views). Requires `schema.bases:read` on the token.
   * @see https://airtable.com/developers/web/api/get-base-schema
   */
  async getBaseSchema(): Promise<BaseSchemaResponse> {
    const url = `${getAirtableApiRoot()}/meta/bases/${encodeURIComponent(this.options.baseId)}/tables`
    const res = await this.fetchApi(url, { headers: await this.authHeader() })
    return this.parseResponse<BaseSchemaResponse>(res)
  }

  /**
   * Create a table in the connected base. Requires `schema.bases:write`.
   * @see https://airtable.com/developers/web/api/create-table
   */
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
    const url = `${getAirtableApiRoot()}/meta/bases/${encodeURIComponent(this.options.baseId)}/tables`
    const res = await this.fetchApi(url, {
      method: 'POST',
      headers: await this.authHeader(),
      body: JSON.stringify(body),
    })
    return this.parseResponse<MetaTableSchema>(res)
  }

  /** Current token owner. Email requires `user.email:read` on the token. */
  async whoami(): Promise<WhoamiResponse> {
    const url = `${getAirtableApiRoot()}/meta/whoami`
    const res = await this.fetchApi(url, { headers: await this.authHeader() })
    return this.parseResponse<WhoamiResponse>(res)
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

  /**
   * Upload a file into a multiple-attachments field (Content API, JSON + base64 body).
   * @see https://airtable.com/developers/web/api/upload-attachment
   */
  async uploadRecordAttachment(options: {
    recordId: string
    fieldName: string
    file: File | Blob
    filename?: string
    contentType?: string
  }): Promise<AirtableRecord<Record<string, unknown>>> {
    const token = await this.requireAccessToken()
    const url = `https://content.airtable.com/v0/${encodeURIComponent(this.options.baseId)}/${encodeURIComponent(options.recordId)}/${encodeURIComponent(options.fieldName)}/uploadAttachment`
    const filename =
      options.filename ??
      (options.file instanceof File ? options.file.name : 'attachment.bin')
    const contentType =
      options.contentType?.trim() ||
      (options.file instanceof File && options.file.type
        ? options.file.type
        : '') ||
      'application/octet-stream'
    const buf = new Uint8Array(await options.file.arrayBuffer())
    const body = JSON.stringify({
      contentType,
      filename,
      file: uint8ToBase64(buf),
    })
    const res = await this.fetchApi(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    })
    return this.parseResponse<AirtableRecord<Record<string, unknown>>>(res)
  }

  async deleteRecords(
    table: string,
    recordIds: string[],
  ): Promise<{ records: { id: string; deleted: boolean }[] }> {
    if (recordIds.length > 10) {
      throw new AirtableApiError('deleteRecords accepts at most 10 ids per call.', {
        status: 400,
      })
    }
    const params = new URLSearchParams()
    recordIds.forEach((id) => params.append('records[]', id))
    const url = `${this.tablePath(table)}?${params.toString()}`
    const res = await this.fetchApi(url, {
      method: 'DELETE',
      headers: await this.authHeader(),
    })
    return this.parseResponse<{ records: { id: string; deleted: boolean }[] }>(
      res,
    )
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}
