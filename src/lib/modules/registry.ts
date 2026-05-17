import { discoverModules } from './discover.ts'
import { getEffectiveEnabledModuleIds } from './modulePreferences.ts'
import type {
  AppModuleDefinition,
  DiscoveredModule,
  ModuleScreenContribution,
} from './types.ts'
import type { ResolvedHeaderSlot } from '../header/headerSlotTypes.ts'
import {
  buildAppDrawerSections,
  buildElectronMenuContributions,
  expandModuleMenuItems,
  getCoreMenuItems,
  type ResolvedMenuItem,
} from '../menu/buildMenu.ts'
import type { ElectronMenuContribution, MenuSection } from '../menu/menuTypes.ts'
import type { ScreenConfig } from '../../config/screens.ts'
import type { AirtableTableConfig } from '../../config/tableTypes.ts'
import { getProvisionedTableId } from './provisionedTableIds.ts'
import { getModuleTableIdCache } from './moduleTableIdCache.ts'
import { isPlaceholderTableId } from './tableBlueprints.ts'
import type { ScreenModule } from './types.ts'

const discovered = discoverModules()

function enabledSet(): Set<string> {
  return new Set(getEffectiveEnabledModuleIds())
}

export function isModuleEnabled(moduleId: string): boolean {
  return enabledSet().has(moduleId)
}

export function getEnabledModuleIds(): readonly string[] {
  return getEffectiveEnabledModuleIds()
}

export function getDiscoveredModules(): readonly DiscoveredModule[] {
  return discovered
}

export function getEnabledModuleDefinitions(): readonly AppModuleDefinition[] {
  return discovered
    .filter((m) => enabledSet().has(m.definition.id))
    .map((m) => m.definition)
}

function resolveModuleTableConfig(
  moduleId: string,
  table: AirtableTableConfig,
): AirtableTableConfig {
  const fromCache = getModuleTableIdCache()[table.key]
  if (fromCache) {
    return { ...table, tableId: fromCache }
  }
  const provisioned = getProvisionedTableId(moduleId, table.key)
  if (provisioned) {
    return { ...table, tableId: provisioned }
  }
  if (isPlaceholderTableId(table.tableId)) {
    return table
  }
  return table
}

export function getModuleTableContributions(): readonly AirtableTableConfig[] {
  return getEnabledModuleDefinitions().flatMap((m) =>
    (m.tables ?? []).map((t) => resolveModuleTableConfig(m.id, t)),
  )
}

export function getModuleScreenContributions(): readonly ModuleScreenContribution[] {
  return getEnabledModuleDefinitions().flatMap((m) => m.screens ?? [])
}

export function getModuleScreenConfigs(): readonly ScreenConfig[] {
  return getModuleScreenContributions().map((s) => ({
    id: s.id,
    title: s.title,
  }))
}

export function getModuleScreenImporters(): Record<
  string,
  () => Promise<ScreenModule>
> {
  const out: Record<string, () => Promise<ScreenModule>> = {}
  for (const screen of getModuleScreenContributions()) {
    out[screen.id] = screen.importScreen
  }
  return out
}

export function getModuleHeaderSlots(): readonly ResolvedHeaderSlot[] {
  const slots: ResolvedHeaderSlot[] = []
  for (const mod of getEnabledModuleDefinitions()) {
    for (const slot of mod.headerSlots ?? []) {
      slots.push({
        key: `${mod.id}:${slot.id}`,
        order: slot.order ?? 100,
        importSlot: slot.importSlot,
      })
    }
  }
  return slots.sort((a, b) => a.order - b.order)
}

export function getResolvedMenuItems(): readonly ResolvedMenuItem[] {
  const items: ResolvedMenuItem[] = [...getCoreMenuItems()]
  for (const mod of getEnabledModuleDefinitions()) {
    items.push(...expandModuleMenuItems(mod.id, mod))
  }
  return items
}

export function getAppDrawerMenuSections(): readonly MenuSection[] {
  return buildAppDrawerSections(getResolvedMenuItems())
}

export function getElectronMenuContributions(): readonly ElectronMenuContribution[] {
  return buildElectronMenuContributions(getResolvedMenuItems())
}

/** @deprecated Use {@link getAppDrawerMenuSections}. */
export function getModuleMenuSections(): readonly MenuSection[] {
  return getAppDrawerMenuSections()
}

export function findDiscoveredModule(
  moduleId: string,
): DiscoveredModule | undefined {
  return discovered.find((m) => m.definition.id === moduleId)
}
