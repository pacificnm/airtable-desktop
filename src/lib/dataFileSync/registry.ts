import { buildingClassificationDataFileMapping } from '../../../module-repos/buildingClassification/lib/buildingClassificationDataFileMapping.ts'
import { buildingClassificationModuleTables } from '../../../module-repos/buildingClassification/tables.ts'
import { countryDataFileMapping } from '../../../module-repos/country/lib/countryDataFileMapping.ts'
import { countryModuleTables } from '../../../module-repos/country/tables.ts'
import { countryModuleFieldsMeta } from '../../../module-repos/country/tables.meta.ts'
import {
  BUILDING_DATA_FILE_CSV_COLUMNS,
} from '../../../module-repos/location/lib/buildingDataFileColumns.ts'
import { buildingDataFileMapping } from '../../../module-repos/location/lib/buildingDataFileMapping.ts'
import { buildBuildingDataFileSyncCoverage } from '../../../module-repos/location/lib/buildingDataFileSyncCoverage.ts'
import { locationModuleTables } from '../../../module-repos/location/tables.ts'
import { locationModuleFieldsMeta } from '../../../module-repos/location/tables.meta.ts'
import { nikeRegionDataFileMapping } from '../../../module-repos/region/lib/nikeRegionDataFileMapping.ts'
import { nikeTerritoryDataFileMapping } from '../../../module-repos/region/lib/nikeTerritoryDataFileMapping.ts'
import { regionModuleTables } from '../../../module-repos/region/tables.ts'
import { regionModuleFieldsMeta } from '../../../module-repos/region/tables.meta.ts'
import { cityDataFileMapping } from '../../../module-repos/city/lib/cityDataFileMapping.ts'
import { cityModuleTables } from '../../../module-repos/city/tables.ts'
import { stateDataFileMapping } from '../../../module-repos/state/lib/stateDataFileMapping.ts'
import { stateModuleTables } from '../../../module-repos/state/tables.ts'
import type { DataFileMapping } from './types.ts'
import type { DataFileMappingRegistryEntry } from './registryTypes.ts'
import {
  buildDataFileSyncCoverage,
  type DataFileSyncCoverageRow,
} from './buildDataFileSyncCoverage.ts'
import {
  validateDataFileMapping,
  type DataFileMappingValidationIssue,
} from './validateDataFileMapping.ts'

function tableFrom(
  tables: readonly { key: string }[],
  tableKey: string,
): DataFileMappingRegistryEntry['table'] | undefined {
  return tables.find((t) => t.key === tableKey) as
    | DataFileMappingRegistryEntry['table']
    | undefined
}

function genericCoverage(
  mapping: DataFileMapping,
  table: DataFileMappingRegistryEntry['table'],
  fieldsMeta?: DataFileMappingRegistryEntry['fieldsMeta'],
  csvColumns?: readonly string[],
): DataFileSyncCoverageRow[] {
  return buildDataFileSyncCoverage({
    mapping,
    table,
    fieldsMeta,
    csvColumns,
  })
}

/** All code-defined data-file mappings (single source of truth). */
export const dataFileMappingRegistry: readonly DataFileMappingRegistryEntry[] = [
  {
    moduleId: 'location',
    mapping: buildingDataFileMapping,
    sourcePath: 'module-repos/location/lib/buildingDataFileMapping.ts',
    table: tableFrom(locationModuleTables, 'building')!,
    fieldsMeta: locationModuleFieldsMeta.building,
    csvColumns: BUILDING_DATA_FILE_CSV_COLUMNS,
    buildCoverage: buildBuildingDataFileSyncCoverage,
    description:
      'Building rows from data-files/location/location_current_*.csv (Electron dataFileBuildingRow).',
  },
  {
    moduleId: 'country',
    mapping: countryDataFileMapping,
    sourcePath: 'module-repos/country/lib/countryDataFileMapping.ts',
    table: tableFrom(countryModuleTables, 'country')!,
    fieldsMeta: countryModuleFieldsMeta.country,
    description: 'Unique countries from the location CSV (COUNTRY / ISO / Nike geo).',
  },
  {
    moduleId: 'state',
    mapping: stateDataFileMapping,
    sourcePath: 'module-repos/state/lib/stateDataFileMapping.ts',
    table: tableFrom(stateModuleTables, 'state')!,
    description: 'Unique STATE + COUNTRY pairs from the location CSV.',
  },
  {
    moduleId: 'city',
    mapping: cityDataFileMapping,
    sourcePath: 'module-repos/city/lib/cityDataFileMapping.ts',
    table: tableFrom(cityModuleTables, 'city')!,
    description: 'Unique CITY + STATE + COUNTRY triples from the location CSV.',
  },
  {
    moduleId: 'buildingClassification',
    mapping: buildingClassificationDataFileMapping,
    sourcePath:
      'module-repos/buildingClassification/lib/buildingClassificationDataFileMapping.ts',
    table: tableFrom(
      buildingClassificationModuleTables,
      'buildingClassification',
    )!,
    description: 'Unique LOCATION_CLASSIFICATION values from the location CSV.',
  },
  {
    moduleId: 'region',
    mapping: nikeRegionDataFileMapping,
    sourcePath: 'module-repos/region/lib/nikeRegionDataFileMapping.ts',
    table: tableFrom(regionModuleTables, 'nikeRegion')!,
    fieldsMeta: regionModuleFieldsMeta.nikeRegion,
    description: 'Unique NIKE_REGION values from the location CSV.',
  },
  {
    moduleId: 'region',
    mapping: nikeTerritoryDataFileMapping,
    sourcePath: 'module-repos/region/lib/nikeTerritoryDataFileMapping.ts',
    table: tableFrom(regionModuleTables, 'nikeTerritory')!,
    fieldsMeta: regionModuleFieldsMeta.nikeTerritory,
    description: 'Unique NIKE_TERRITORY values from the location CSV.',
  },
]

export function getDataFileMappingRegistryEntry(
  mappingId: string,
): DataFileMappingRegistryEntry | undefined {
  return dataFileMappingRegistry.find((e) => e.mapping.id === mappingId)
}

export function getRegistryCoverage(
  entry: DataFileMappingRegistryEntry,
): DataFileSyncCoverageRow[] {
  if (entry.buildCoverage) {
    return entry.buildCoverage(entry.mapping)
  }
  return genericCoverage(
    entry.mapping,
    entry.table,
    entry.fieldsMeta,
    entry.csvColumns,
  )
}

export function validateRegistryEntry(
  entry: DataFileMappingRegistryEntry,
): DataFileMappingValidationIssue[] {
  const knownCsv = entry.csvColumns
    ? new Set(entry.csvColumns as readonly string[])
    : undefined
  return validateDataFileMapping(entry.mapping, entry.table, {
    knownCsvColumns: knownCsv,
  })
}

export function validateAllDataFileMappings(): {
  entry: DataFileMappingRegistryEntry
  issues: DataFileMappingValidationIssue[]
}[] {
  return dataFileMappingRegistry.map((entry) => ({
    entry,
    issues: validateRegistryEntry(entry),
  }))
}
