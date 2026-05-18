import type { BaseSchemaResponse, MetaTableSchema } from './metaTypes.ts'
import type {
  AirtableRecord,
  ListAllRecordsOptions,
  ListAllRecordsResult,
  ListRecordsQuery,
  ListRecordsResponse,
  WhoamiResponse,
} from './types.ts'

/** Public read/write surface used across the app (REST + caching wrapper). */
export interface AirtableClient {
  readonly baseId: string
  listRecords<TFields = Record<string, unknown>>(
    table: string,
    query?: ListRecordsQuery,
  ): Promise<ListRecordsResponse<TFields>>
  getRecord<TFields = Record<string, unknown>>(
    tableId: string,
    recordId: string,
  ): Promise<AirtableRecord<TFields>>
  retrieveRecord<TFields = Record<string, unknown>>(
    table: string,
    recordId: string,
  ): Promise<AirtableRecord<TFields>>
  listAllRecords<TFields = Record<string, unknown>>(
    table: string,
    options?: ListAllRecordsOptions,
  ): Promise<ListAllRecordsResult<TFields>>
  getBaseSchema(): Promise<BaseSchemaResponse>
  findTableById(tableId: string): Promise<MetaTableSchema>
  createRecords<TFields = Record<string, unknown>>(
    table: string,
    records: { fields: TFields }[],
  ): Promise<{ records: AirtableRecord<TFields>[] }>
  updateRecords<TFields = Record<string, unknown>>(
    table: string,
    records: { id: string; fields: Partial<TFields> }[],
    destructive?: boolean,
  ): Promise<{ records: AirtableRecord<TFields>[] }>
  deleteRecords(
    table: string,
    recordIds: string[],
  ): Promise<{ records: { id: string; deleted: boolean }[] }>
  createTable(body: {
    name: string
    fields: {
      name: string
      type: string
      description?: string
      options?: Record<string, unknown>
    }[]
    description?: string
  }): Promise<MetaTableSchema>
  whoami(): Promise<WhoamiResponse>
  uploadRecordAttachment(options: {
    recordId: string
    fieldName: string
    file: File | Blob
    filename?: string
    contentType?: string
  }): Promise<AirtableRecord<Record<string, unknown>>>
}
