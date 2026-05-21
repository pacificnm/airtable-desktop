import type { AirtableTableConfig } from '@/config/tableTypes.ts'
import type { MetaFieldSnapshot } from '@/config/tableTypes.ts'
import type { DataFileMapping } from './types.ts'
import type { DataFileSyncCoverageRow } from './buildDataFileSyncCoverage.ts'

/** One code-defined mapping registered for discovery, validation, and UI. */
export interface DataFileMappingRegistryEntry {
  /** Owning module id (e.g. `location`). */
  moduleId: string
  mapping: DataFileMapping
  /** Repo-relative path to the mapping source file. */
  sourcePath: string
  /** Table config from the module's `tables.ts` (not gated on module enable). */
  table: AirtableTableConfig
  /** Optional field meta from `tables.meta.ts` for type labels in coverage. */
  fieldsMeta?: readonly MetaFieldSnapshot[]
  /**
   * Known CSV columns for this data source (e.g. Electron `dataFileBuildingRow`).
   * When set, coverage includes unmapped CSV columns.
   */
  csvColumns?: readonly string[]
  /** Optional table-specific coverage builder; defaults to generic builder. */
  buildCoverage?: (mapping: DataFileMapping) => DataFileSyncCoverageRow[]
  /** Short note shown on the Developer screen (data file path, dependencies, etc.). */
  description?: string
}
