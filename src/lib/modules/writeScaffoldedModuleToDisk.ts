import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  customModuleDir,
  defaultModuleDir,
  type ModuleDiscoveryDir,
} from '../../config/moduleLocations.ts'
import type { ScaffoldModuleFile } from './scaffoldModuleFromTable.ts'

export function moduleDirectoryExists(
  moduleId: string,
  projectRoot: string,
): { exists: boolean; dir?: ModuleDiscoveryDir } {
  const custom = join(projectRoot, customModuleDir, moduleId)
  if (existsSync(custom)) return { exists: true, dir: customModuleDir }
  const builtIn = join(projectRoot, defaultModuleDir, moduleId)
  if (existsSync(builtIn)) return { exists: true, dir: defaultModuleDir }
  return { exists: false }
}

/** Write scaffold files under `<projectRoot>/module-repos/<moduleId>/`. */
export async function writeScaffoldedModuleToDisk(
  projectRoot: string,
  moduleId: string,
  files: readonly ScaffoldModuleFile[],
): Promise<{ ok: true; written: string[]; moduleRoot: string } | { ok: false; error: string }> {
  const moduleRoot = join(projectRoot, customModuleDir, moduleId)
  const written: string[] = []

  try {
    for (const file of files) {
      const absolutePath = join(moduleRoot, file.relativePath)
      await mkdir(dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, file.content, 'utf8')
      written.push(file.relativePath)
    }
    return { ok: true, written, moduleRoot }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to write module files',
    }
  }
}
