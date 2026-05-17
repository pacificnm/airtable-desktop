import type { AppView } from '../../components/main/appView.ts'
import type { AppModuleDefinition } from '../modules/types.ts'
import { coreMenuItems } from './coreMenuContributions.ts'
import type {
  AppDrawerMenuPlacement,
  ElectronMenuContribution,
  ElectronMenuPlacement,
  MenuIconId,
  MenuNavItem,
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

function drawerSectionKey(moduleId: string, sectionId: string): string {
  return `${moduleId}:${sectionId}`
}

function itemOrder(placement: AppDrawerMenuPlacement | ElectronMenuPlacement, fallback: number): number {
  return placement.order ?? fallback
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
      placements: item.placements,
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
            section: { id: section.id, label: section.label },
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
    { label: string; entries: { order: number; nav: MenuNavItem }[] }
  >()

  for (const item of items) {
    for (const placement of item.placements) {
      if (placement.surface !== 'appDrawer') continue
      const sectionId = drawerSectionKey(item.moduleId, placement.section.id)
      let section = sectionMap.get(sectionId)
      if (!section) {
        section = { label: placement.section.label, entries: [] }
        sectionMap.set(sectionId, section)
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

  const sections: MenuSection[] = [...sectionMap.entries()].map(([id, section]) => ({
    id,
    label: section.label,
    items: section.entries
      .sort((a, b) => a.order - b.order)
      .map((e) => e.nav),
  }))

  return sections.sort((a, b) => {
    if (a.id === 'core:main') return -1
    if (b.id === 'core:main') return 1
    return a.label.localeCompare(b.label)
  })
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
