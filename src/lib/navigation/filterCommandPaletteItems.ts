import type { CommandPaletteItem } from './commandPaletteItems.ts'

export function filterCommandPaletteItems(
  items: readonly CommandPaletteItem[],
  query: string,
): CommandPaletteItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...items]
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.includes(q) ||
      item.section.toLowerCase().includes(q),
  )
}
