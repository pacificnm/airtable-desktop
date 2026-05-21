/**
 * Assign building + geo modules to the global "Buildings" drawer section.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** module folder → menu item order within Buildings section */
const LOCATION_MODULES = {
  location: 0,
  space: 10,
  country: 20,
  region: 30,
  state: 40,
  city: 50,
  neighborhood: 60,
  buildingClassification: 70,
  buildingStatus: 80,
  merge: 90,
}

const menuNavBlock = `  menuNav: {
    groups: [{ id: 'location', label: 'Buildings', scope: 'global', order: 20 }],
  },`

for (const [moduleId, itemOrder] of Object.entries(LOCATION_MODULES)) {
  const indexPath = join('module-repos', moduleId, 'index.ts')
  if (!existsSync(indexPath)) {
    console.warn(`skip missing ${indexPath}`)
    continue
  }

  let src = readFileSync(indexPath, 'utf8')

  src = src.replace(/  menuNav: \{[\s\S]*?\n  \},/m, menuNavBlock)
  src = src.replace(/menuGroupId: '(?:buildings|reference)'/, "menuGroupId: 'location'")

  if (/order:\s*\d+/.test(src)) {
    src = src.replace(/order:\s*\d+,/, `order: ${itemOrder},`)
  } else {
    src = src.replace(
      /menuGroupId: 'location',/,
      `menuGroupId: 'location',\n      order: ${itemOrder},`,
    )
  }

  writeFileSync(indexPath, src)
  console.log(`updated ${moduleId} (order ${itemOrder})`)
}

console.log('Done')
