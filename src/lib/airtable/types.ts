/** Single record returned by the Web API. @see https://airtable.com/developers/web/api/get-record */
export interface AirtableRecord<TFields = Record<string, unknown>> {
  id: string
  createdTime: string
  fields: TFields
}

export interface ListRecordsResponse<TFields = Record<string, unknown>> {
  records: AirtableRecord<TFields>[]
  offset?: string
}

export interface SortParam {
  field: string
  direction?: 'asc' | 'desc'
}

export interface ListRecordsQuery {
  pageSize?: number
  maxRecords?: number
  offset?: string
  view?: string
  filterByFormula?: string
  sort?: SortParam[]
}

/** Options for {@link AirtableRestClient.listAllRecords} (offset pagination). */
export interface ListAllRecordsOptions extends ListRecordsQuery {
  /**
   * Stop after this many records total (safety cap).
   * If omitted, fetches until Airtable returns no `offset`.
   */
  maxTotal?: number
  /** Stop after this many API pages (default 1000). */
  maxPages?: number
  /** Invoked after each page (for progress UI). */
  onPage?: (page: {
    records: AirtableRecord[]
    pageIndex: number
    hasMore: boolean
  }) => void
}

export interface ListAllRecordsResult<TFields = Record<string, unknown>> {
  records: AirtableRecord<TFields>[]
  /** True when stopped early due to `maxTotal` or `maxPages`. */
  truncated: boolean
  pagesFetched: number
}

export interface OAuthTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  scope: string
  expires_in: number
  refresh_expires_in: number
}

/** @see https://airtable.com/developers/web/api/get-user-id-scopes */
export interface WhoamiResponse {
  id: string
  email?: string
  scopes?: string[]
}
