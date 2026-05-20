import { getElectronModulesBridge } from './electronModulesBridge.ts'
import { customModuleDir } from '../../config/moduleLocations.ts'
import type { ScaffoldModuleFile } from './scaffoldModuleFromTable.ts'

export async function writeScaffoldedModuleFiles(
  moduleId: string,
  files: readonly ScaffoldModuleFile[],
): Promise<{ ok: true; written: string[] } | { ok: false; error: string }> {
  const bridge = getElectronModulesBridge()
  if (!bridge?.writeModuleFile) {
    return {
      ok: false,
      error: 'Scaffold writes require Electron dev (modules:writeModuleFile).',
    }
  }

  const moduleRoot = `${customModuleDir}/${moduleId}`
  const written: string[] = []

  for (const file of files) {
    const result = await bridge.writeModuleFile(moduleRoot, file.relativePath, file.content)
    if (!result.ok) {
      return {
        ok: false,
        error: result.error ?? `Failed to write ${file.relativePath}`,
      }
    }
    written.push(file.relativePath)
  }

  return { ok: true, written }
}
