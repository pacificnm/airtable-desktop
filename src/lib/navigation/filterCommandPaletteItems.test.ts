import { describe, expect, it } from 'vitest'
import type { CommandPaletteItem } from './commandPaletteItems.ts'
import { filterCommandPaletteItems } from './filterCommandPaletteItems.ts'

const sample: CommandPaletteItem[] = [
  {
    id: 'menu:home',
    label: 'Home',
    section: 'App',
    icon: 'home',
    keywords: 'home app',
    resolveNavigate: () => 'home',
  },
  {
    id: 'menu:docs',
    label: 'Documentation',
    section: 'Developer',
    icon: 'menuBook',
    keywords: 'documentation developer docs',
    resolveNavigate: () => 'devDocs',
  },
]

describe('filterCommandPaletteItems', () => {
  it('returns all items when query is empty', () => {
    expect(filterCommandPaletteItems(sample, '')).toHaveLength(2)
  })

  it('filters by label', () => {
    expect(filterCommandPaletteItems(sample, 'doc')).toEqual([sample[1]])
  })

  it('filters by section name', () => {
    expect(filterCommandPaletteItems(sample, 'developer')).toEqual([sample[1]])
  })
})
