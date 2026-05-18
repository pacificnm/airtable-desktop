/**
 * Runs Electron and restarts when dist-electron main/preload are rebuilt (tsc --watch).
 */
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const mainJs = path.join(root, 'dist-electron', 'main.js')
const preloadJs = path.join(root, 'dist-electron', 'preload.js')

let electron = null
let restarting = false

function startElectron() {
  if (electron) {
    electron.removeAllListeners()
    electron.kill()
    electron = null
  }
  electron = spawn('npx', ['electron', '.'], {
    cwd: root,
    env: { ...process.env },
    stdio: 'inherit',
    shell: true,
  })
  electron.on('exit', (code, signal) => {
    if (!restarting && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
      process.exit(code ?? 0)
    }
  })
}

function scheduleRestart() {
  if (restarting) return
  restarting = true
  setTimeout(() => {
    restarting = false
    startElectron()
  }, 300)
}

startElectron()
watch(mainJs, scheduleRestart)
watch(preloadJs, scheduleRestart)
