import { getAppDrawerMenuSections } from '../lib/modules/registry.ts'

export type {
  MenuIconId,
  MenuNavItem,
  MenuSection,
} from '../lib/menu/menuTypes.ts'

/** Drawer (hamburger) menu sections from core + enabled modules. */
export function getMainMenuSections() {
  return getAppDrawerMenuSections()
}
