import { describe, expect, it, vi } from 'vitest'
import { sortModulesByDependencies } from './moduleDependencies.ts'

vi.mock('./registry.ts', () => ({
  findDiscoveredModule: (id: string) => {
    const deps: Record<string, string[]> = {
      config: [],
      roles: ['config'],
      users: ['config', 'roles'],
    }
    return deps[id] != null ? { definition: { dependsOn: deps[id] } } : undefined
  },
  isModuleEnabled: () => true,
}))

vi.mock('./moduleProvisioningState.ts', () => ({
  moduleNeedsTableProvisioning: () => false,
}))

describe('sortModulesByDependencies', () => {
  it('orders config before roles before users', () => {
    expect(sortModulesByDependencies(['users', 'config', 'roles'])).toEqual([
      'config',
      'roles',
      'users',
    ])
  })
})
