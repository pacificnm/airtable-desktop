import { enrichDebugError } from './errorLocation.ts'
import type {
  DebugErrorEntry,
  DebugNetworkEntry,
  DebugPerfEntry,
  DebugSnapshot,
} from './types.ts'

const MAX_NETWORK = 80
const MAX_ERRORS = 50

let nextId = 1
function uid(): string {
  return `dbg-${nextId++}-${Date.now().toString(36)}`
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.searchParams.has('access_token')) {
      u.searchParams.set('access_token', '***')
    }
    return u.toString()
  } catch {
    return url
  }
}

function buildSnapshot(
  network: DebugNetworkEntry[],
  errors: DebugErrorEntry[],
  perf: DebugPerfEntry[],
): DebugSnapshot {
  const failedNetworkCount = network.filter(
    (n) => !n.ok || (n.status != null && n.status >= 400),
  ).length
  return {
    network,
    errors,
    perf,
    failedNetworkCount,
    errorCount: errors.length,
  }
}

class DebugStore {
  private listeners = new Set<() => void>()
  private network: DebugNetworkEntry[] = []
  private errors: DebugErrorEntry[] = []
  private perf: DebugPerfEntry[] = []
  /** Stable reference for `useSyncExternalStore` between updates. */
  private cachedSnapshot: DebugSnapshot = buildSnapshot([], [], [])

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private rebuildSnapshot(): void {
    this.cachedSnapshot = buildSnapshot(this.network, this.errors, this.perf)
  }

  private notify(): void {
    this.rebuildSnapshot()
    for (const l of this.listeners) l()
  }

  getSnapshot(): DebugSnapshot {
    return this.cachedSnapshot
  }

  addNetwork(partial: Omit<DebugNetworkEntry, 'id' | 'timestamp'>): void {
    this.network = [
      {
        id: uid(),
        timestamp: Date.now(),
        ...partial,
        url: redactUrl(partial.url),
      },
      ...this.network,
    ].slice(0, MAX_NETWORK)
    this.notify()
  }

  addError(partial: Omit<DebugErrorEntry, 'id' | 'timestamp'>): void {
    this.errors = [
      { id: uid(), timestamp: Date.now(), ...enrichDebugError(partial) },
      ...this.errors,
    ].slice(0, MAX_ERRORS)
    this.notify()
  }

  setPerf(entries: DebugPerfEntry[]): void {
    this.perf = entries
    this.notify()
  }

  clearNetwork(): void {
    this.network = []
    this.notify()
  }

  clearErrors(): void {
    this.errors = []
    this.notify()
  }

  clearAll(): void {
    this.network = []
    this.errors = []
    this.notify()
  }
}

export const debugStore = new DebugStore()
