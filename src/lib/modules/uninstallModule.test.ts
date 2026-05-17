import { describe, expect, it, vi } from 'vitest'
import { getUninstallBlockers } from './uninstallModule.ts'

vi.mock('./registry.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./registry.ts')>()
  return {
    ...actual,
    getDiscoveredModules: () => [
      {
        definition: { id: 'config', name: 'Config', version: '0', dependsOn: [] },
        rootPath: 'modules/config',
      },
      {
        definition: { id: 'users', name: 'Users', version: '0', dependsOn: ['config'] },
        rootPath: 'modules/users',
      },
    ],
    isModuleEnabled: (id: string) => id === 'config' || id === 'users',
  }
})

describe('getUninstallBlockers', () => {
  it('blocks when dependents are enabled', () => {
    const blockers = getUninstallBlockers('config')
    expect(blockers.length).toBeGreaterThan(0)
    expect(blockers[0]).toContain('users')
  })

  it('allows leaf modules', () => {
    expect(getUninstallBlockers('users')).toEqual([])
  })
})
