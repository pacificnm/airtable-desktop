#!/usr/bin/env node
/**
 * Fetch full base schema from Airtable Meta API and write JSON to stdout or a file.
 *
 * Credentials (first match wins):
 *   --from-electron   Read active connection profile from Airtable Desktop userData
 *   .env / env        VITE_AIRTABLE_PAT + VITE_AIRTABLE_BASE_ID
 *
 * Usage:
 *   node scripts/fetch-base-schema.mjs --from-electron
 *   node scripts/fetch-base-schema.mjs --from-electron --out base-schema.json
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fromElectron = process.argv.includes('--from-electron')

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = val
    }
  } catch {
    // no .env
  }
}

loadEnvFile(resolve(root, '.env'))

const PROFILE_STORE_KEY = 'airtable.connection.profiles.v1'

function electronUserDataDir() {
  const home = homedir()
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA ?? join(home, 'AppData', 'Roaming')
    return join(appData, 'Airtable Desktop')
  }
  if (process.platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Airtable Desktop')
  }
  return join(home, '.config', 'airtable-desktop')
}

function readElectronConnectionProfile() {
  const ldbDir = join(electronUserDataDir(), 'Local Storage', 'leveldb')
  if (!existsSync(ldbDir)) {
    throw new Error(`Electron localStorage not found: ${ldbDir}`)
  }

  let blob = ''
  for (const name of readdirSync(ldbDir)) {
    if (!name.endsWith('.ldb') && !name.endsWith('.log')) continue
    try {
      blob += readFileSync(join(ldbDir, name), 'utf8')
    } catch {
      // file locked or unreadable
    }
  }

  if (!blob.includes(PROFILE_STORE_KEY)) {
    throw new Error(
      'No connection profile in Electron storage. Open the app and connect once.',
    )
  }

  // Chromium LevelDB values are not always valid JSON strings; extract stable fields.
  const text = blob.replace(/\u0000/g, '')
  const profiles = [...text.matchAll(/"baseId":"(app[A-Za-z0-9]+)"/g)].map((m) => m[1])
  const pats = [...text.matchAll(/"pat":"(pat[A-Za-z0-9._-]+)"/g)].map((m) => m[1])
  const names = [...text.matchAll(/"name":"([^"]+)"/g)].map((m) => m[1])
  const activeId = text.match(/"activeProfileId":"([^"]+)"/)?.[1]

  if (profiles.length === 0) {
    throw new Error('Could not read baseId from Electron connection profile.')
  }

  let index = 0
  if (activeId) {
    const idPattern = new RegExp(
      `"id":"${activeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?"baseId":"(app[A-Za-z0-9]+)"`,
    )
    const activeMatch = text.match(idPattern)
    if (activeMatch) {
      const baseId = activeMatch[1]
      index = profiles.indexOf(baseId)
      if (index === -1) index = 0
    }
  }

  const baseId = profiles[index] ?? profiles[0]
  const pat = pats[index] ?? pats[0]
  if (!pat) {
    throw new Error(
      'Active profile has no PAT (OAuth-only?). Add a PAT in Connection or use .env.',
    )
  }

  return {
    baseId,
    pat,
    profileName: names[index] ?? names[0] ?? 'Default',
  }
}

let pat = process.env.VITE_AIRTABLE_PAT?.trim()
let baseId = process.env.VITE_AIRTABLE_BASE_ID?.trim()

if (fromElectron) {
  const profile = readElectronConnectionProfile()
  pat = profile.pat
  baseId = profile.baseId
  console.error(`Using Electron profile "${profile.profileName}" → base ${baseId}`)
}

const outArg = process.argv.indexOf('--out')
const outPath = outArg !== -1 ? process.argv[outArg + 1] : undefined

if (!pat || !baseId) {
  console.error(
    'Set VITE_AIRTABLE_PAT and VITE_AIRTABLE_BASE_ID in .env, or pass --from-electron.',
  )
  process.exit(1)
}

const url = `https://api.airtable.com/v0/meta/bases/${encodeURIComponent(baseId)}/tables`
const res = await fetch(url, {
  headers: {
    Authorization: `Bearer ${pat}`,
    'Content-Type': 'application/json',
  },
})

if (!res.ok) {
  const body = await res.text()
  console.error(`Meta API ${res.status}: ${body}`)
  process.exit(1)
}

const schema = await res.json()
const json = JSON.stringify(schema, null, 2)

if (outPath) {
  writeFileSync(outPath, json, 'utf8')
  console.error(`Wrote ${outPath}`)
} else {
  process.stdout.write(json)
}

const tables = schema.tables ?? []
console.error(`\n${tables.length} tables in base ${baseId}:`)
for (const table of [...tables].sort((a, b) => a.name.localeCompare(b.name))) {
  const primary =
    table.fields?.find((f) => f.id === table.primaryFieldId)?.name ??
    table.fields?.[0]?.name ??
    '?'
  console.error(`  ${table.name}\t${table.id}\t(${table.fields?.length ?? 0} fields, primary: ${primary})`)
}
