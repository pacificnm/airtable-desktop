/**
 * One-time: move scaffolded modules from inline drawer placements to menuNav + menuGroupId.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = 'module-repos'
const marker = "section: { id: 'reference', label: 'Reference data' }"
const placementBlock =
  /\s*placements: \[\s*\{\s*surface: 'appDrawer',\s*section: \{ id: 'reference', label: 'Reference data' \},\s*\},\s*\],/g

const menuNavBlock = `  menuNav: {
    groups: [
      { id: 'reference', label: 'Reference data', scope: 'global', order: 200 },
    ],
  },`

let patched = 0
for (const dir of readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const indexPath = join(root, dir.name, 'index.ts')
  if (!existsSync(indexPath)) continue
  let src = readFileSync(indexPath, 'utf8')
  if (!src.includes(marker)) continue

  src = src.replace(placementBlock, "\n      menuGroupId: 'reference',")
  if (!src.includes('menuNav:')) {
    src = src.replace(/  menuItems: \[/, `${menuNavBlock}\n  menuItems: [`)
  }
  writeFileSync(indexPath, src)
  patched += 1
  console.log(`patched ${dir.name}`)
}

console.log(`Done: ${patched} modules`)
