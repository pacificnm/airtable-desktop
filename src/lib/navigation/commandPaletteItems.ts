import type { AppView } from '../../components/main/appView.ts'
import type { MenuIconId } from '../../config/menu.ts'
import { getMainMenuSections } from '../../config/menu.ts'
import { screens } from '../../config/screens.ts'

export interface CommandPaletteItem {
  id: string
  label: string
  section: string
  icon: MenuIconId
  keywords: string
  resolveNavigate: (view: AppView) => AppView
}

/** Nav targets for quick-jump (drawer menu + screens not listed in the menu). */
export function getCommandPaletteItems(): CommandPaletteItem[] {
  const fromMenu: CommandPaletteItem[] = getMainMenuSections().flatMap((section) =>
    section.items.map((item) => ({
      id: `menu:${item.id}`,
      label: item.label,
      section: section.label || 'App',
      icon: item.icon,
      keywords: [item.label, section.label, item.id].filter(Boolean).join(' ').toLowerCase(),
      resolveNavigate: item.resolveNavigate,
    })),
  )

  const menuViews = new Set(
    fromMenu.map((item) => item.resolveNavigate('home')),
  )

  const extras: CommandPaletteItem[] = screens
    .filter((s) => !menuViews.has(s.id))
    .map((s) => ({
      id: `screen:${s.id}`,
      label: s.title,
      section: 'Screens',
      icon: 'gridView' as MenuIconId,
      keywords: [s.title, s.id].join(' ').toLowerCase(),
      resolveNavigate: () => s.id,
    }))

  return [...fromMenu, ...extras]
}
