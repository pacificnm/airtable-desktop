/**
 * Batch-scaffold module-repos/* from base-schema.json (Meta API dump).
 *
 *   npx vite-node scripts/scaffold-modules-from-schema.ts
 *   npx vite-node scripts/scaffold-modules-from-schema.ts --schema path/to.json
 *   npx vite-node scripts/scaffold-modules-from-schema.ts --dry-run
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BaseSchemaResponse } from '../src/lib/airtable/metaTypes.ts'
import { buildBaseTableInventory } from '../src/lib/modules/baseTableInventory.ts'
import {
  isReservedModuleId,
  moduleIdFromTable,
  scaffoldModuleFiles,
} from '../src/lib/modules/scaffoldModuleFromTable.ts'
import {
  moduleDirectoryExists,
  writeScaffoldedModuleToDisk,
} from '../src/lib/modules/writeScaffoldedModuleToDisk.ts'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDir, '..')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const schemaArg = args.indexOf('--schema')
const schemaPath = resolve(
  projectRoot,
  schemaArg !== -1 ? args[schemaArg + 1]! : 'base-schema.json',
)

function loadSchema(): BaseSchemaResponse {
  const raw = readFileSync(schemaPath, 'utf8')
  const parsed = JSON.parse(raw) as BaseSchemaResponse
  if (!Array.isArray(parsed.tables)) {
    throw new Error(`Invalid schema file (missing tables): ${schemaPath}`)
  }
  return parsed
}

async function main() {
  const schema = loadSchema()
  const rows = buildBaseTableInventory(schema.tables)

  const toScaffold = rows.filter((row) => {
    if (row.coveredBy) return false
    const meta = schema.tables.find((t) => t.id === row.tableId)
    if (!meta) return false
    const moduleId = moduleIdFromTable(meta)
    if (isReservedModuleId(moduleId)) {
      console.warn(
        `skip ${row.tableName}: module id "${moduleId}" is reserved (use built-in module in modules/)`,
      )
      return false
    }
    if (moduleDirectoryExists(moduleId, projectRoot).exists) {
      console.warn(`skip ${row.tableName}: folder "${moduleId}" already exists`)
      return false
    }
    return true
  })

  console.log(
    `Schema: ${schemaPath} — ${rows.length} tables, ${toScaffold.length} to scaffold` +
      (dryRun ? ' (dry run)' : ''),
  )

  if (toScaffold.length === 0) {
    return
  }

  let ok = 0
  let failed = 0

  for (const row of toScaffold) {
    const meta = schema.tables.find((t) => t.id === row.tableId)!
    const moduleId = moduleIdFromTable(meta)
    const files = scaffoldModuleFiles({ meta, moduleId })

    if (dryRun) {
      console.log(`  would create module-repos/${moduleId}/ (${files.length} files) ← ${row.tableName}`)
      ok += 1
      continue
    }

    const result = await writeScaffoldedModuleToDisk(projectRoot, moduleId, files)
    if (!result.ok) {
      console.error(`  FAIL ${moduleId}: ${result.error}`)
      failed += 1
      continue
    }
    console.log(
      `  OK module-repos/${moduleId}/ (${result.written.length} files) ← ${row.tableName} [${row.tableId}]`,
    )
    ok += 1
  }

  console.log(`\nDone: ${ok} scaffolded, ${failed} failed, ${rows.length - toScaffold.length} skipped.`)
  if (!dryRun && ok > 0) {
    console.log(
      'Next: enable modules in Developer → Modules (or src/config/enabledModules.ts), then git init each folder under module-repos/.',
    )
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
