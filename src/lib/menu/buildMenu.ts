import type { AppView } from '../../components/main/appView.ts'
import type {
  AppModuleDefinition,
  ModuleMenuItemContribution,
} from '../modules/types.ts'
import { coreMenuItems } from './coreMenuContributions.ts'
import type {
  AppDrawerMenuPlacement,
  ElectronMenuContribution,
  ElectronMenuPlacement,
  MenuIconId,
  MenuNavItem,
  MenuNavSectionRef,
  MenuPlacement,
  MenuSection,
} from './menuTypes.ts'

export interface ResolvedMenuItem {
  key: string
  moduleId: string
  itemId: string
  label: string
  viewId: AppView
  icon: MenuIconId
  order: number
  placements: readonly MenuPlacement[]
}

export function drawerSectionKey(
  moduleId: string,
  section: MenuNavSectionRef,
): string {
  if (section.scope === 'global') return `global:${section.id}`
  return `${moduleId}:${section.id}`
}

function itemOrder(
  placement: AppDrawerMenuPlacement | ElectronMenuPlacement,
  fallback: number,
): number {
  return placement.order ?? fallback
}

function drawerPlacementFromGroup(
  group: NonNullable<AppModuleDefinition['menuNav']>['groups'][number],
): AppDrawerMenuPlacement {
  return {
    surface: 'appDrawer',
    section: {
      id: group.id,
      label: group.label,
      scope: group.scope,
      order: group.order,
    },
  }
}

export function resolveModuleMenuItemPlacements(
  moduleId: string,
  definition: AppModuleDefinition,
  item: ModuleMenuItemContribution,
): readonly MenuPlacement[] {
  const explicit = item.placements ?? []
  const group = item.menuGroupId
    ? definition.menuNav?.groups.find((g) => g.id === item.menuGroupId)
    : undefined

  if (item.menuGroupId && !group) {
    console.warn(
      `[${moduleId}] menu item "${item.id}" references unknown menuGroupId "${item.menuGroupId}"`,
    )
  }

  const fromGroup = group ? [drawerPlacementFromGroup(group)] : []
  const nonDrawer = explicit.filter((p) => p.surface !== 'appDrawer')

  if (fromGroup.length > 0) {
    return [...fromGroup, ...nonDrawer]
  }

  return explicit
}

export function expandModuleMenuItems(
  moduleId: string,
  definition: AppModuleDefinition,
): ResolvedMenuItem[] {
  if (definition.menuItems?.length) {
    return definition.menuItems.map((item, index) => ({
      key: `${moduleId}:${item.id}`,
      moduleId,
      itemId: item.id,
      label: item.label,
      viewId: item.viewId,
      icon: item.icon,
      order: item.order ?? index * 10,
      placements: resolveModuleMenuItemPlacements(moduleId, definition, item),
    }))
  }

  if (!definition.menuSections?.length) return []

  const out: ResolvedMenuItem[] = []
  for (const section of definition.menuSections) {
    section.items.forEach((item, index) => {
      out.push({
        key: `${moduleId}:${item.id}`,
        moduleId,
        itemId: item.id,
        label: item.label,
        viewId: item.viewId,
        icon: item.icon,
        order: index * 10,
        placements: [
          {
            surface: 'appDrawer',
            section: { id: section.id, label: section.label, scope: 'module' },
          },
        ],
      })
    })
  }
  return out
}

export function getCoreMenuItems(): ResolvedMenuItem[] {
  return coreMenuItems.map((item) => ({
    key: `core:${item.id}`,
    moduleId: 'core',
    itemId: item.id,
    label: item.label,
    viewId: item.viewId as AppView,
    icon: item.icon,
    order: item.order ?? 0,
    placements: item.placements,
  }))
}

export function buildAppDrawerSections(items: readonly ResolvedMenuItem[]): MenuSection[] {
  const sectionMap = new Map<
    string,
    { label: string; sectionOrder: number; entries: { order: number; nav: MenuNavItem }[] }
  >()

  for (const item of items) {
    for (const placement of item.placements) {
      if (placement.surface !== 'appDrawer') continue
      const sectionId = drawerSectionKey(item.moduleId, placement.section)
      let section = sectionMap.get(sectionId)
      const sectionOrder = placement.section.order ?? 1000
      if (!section) {
        section = {
          label: placement.section.label,
          sectionOrder,
          entries: [],
        }
        sectionMap.set(sectionId, section)
      } else if (sectionOrder < section.sectionOrder) {
        section.sectionOrder = sectionOrder
      }
      if (
        placement.section.label &&
        section.label !== placement.section.label &&
        section.entries.length > 0
      ) {
        console.warn(
          `Drawer section "${sectionId}" label mismatch: "${section.label}" vs "${placement.section.label}"`,
        )
      } else if (placement.section.label) {
        section.label = placement.section.label
      }
      section.entries.push({
        order: itemOrder(placement, item.order),
        nav: {
          id: item.key,
          label: item.label,
          icon: item.icon,
          isSelected: (v) => v === item.viewId,
          resolveNavigate: () => item.viewId,
        },
      })
    }
  }

  const built = [...sectionMap.entries()].map(([id, section]) => ({
    id,
    label: section.label,
    sectionOrder: section.sectionOrder,
    items: section.entries
      .sort((a, b) => a.order - b.order)
      .map((e) => e.nav),
  }))

  built.sort((a, b) => {
    if (a.id === 'core:main') return -1
    if (b.id === 'core:main') return 1
    if (a.sectionOrder !== b.sectionOrder) return a.sectionOrder - b.sectionOrder
    return a.label.localeCompare(b.label)
  })

  return built.map(({ id, label, items }) => ({ id, label, items }))
}

export function buildElectronMenuContributions(
  items: readonly ResolvedMenuItem[],
): ElectronMenuContribution[] {
  const out: ElectronMenuContribution[] = []

  for (const item of items) {
    for (const placement of item.placements) {
      if (placement.surface !== 'electron') continue
      out.push({
        menu: (placement as ElectronMenuPlacement).menu,
        label: item.label,
        viewId: item.viewId,
        order: itemOrder(placement as ElectronMenuPlacement, item.order),
      })
    }
  }

  return out.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
}
