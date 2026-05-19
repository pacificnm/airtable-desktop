import type { AppView } from '../../components/main/appView.ts'
import { isValidAppView } from './appViewPersistence.ts'

export interface NavigationEntry {
  view: AppView
  /** Route-scoped params (e.g. `{ locationId: 'rec…' }`). */
  params: Readonly<Record<string, string>>
}

export interface NavigationStack {
  /** Most-recent entry is last. Length is always >= 1. */
  entries: readonly NavigationEntry[]
}

const STORAGE_KEY = 'app.navigation.v1'
const MAX_STACK_DEPTH = 32
const DEFAULT_VIEW: AppView = 'home'

export const EMPTY_PARAMS: Readonly<Record<string, string>> = Object.freeze({})

function defaultStack(): NavigationStack {
  return { entries: [{ view: DEFAULT_VIEW, params: EMPTY_PARAMS }] }
}

function isParams(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null) return false
  return Object.values(value as Record<string, unknown>).every(
    (v) => typeof v === 'string',
  )
}

function isEntry(value: unknown): value is NavigationEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as { view?: unknown; params?: unknown }
  return (
    typeof entry.view === 'string' &&
    isValidAppView(entry.view) &&
    (entry.params === undefined || isParams(entry.params))
  )
}

function normalizeEntry(entry: NavigationEntry): NavigationEntry {
  return {
    view: entry.view,
    params: entry.params ?? EMPTY_PARAMS,
  }
}

export function readNavigationStack(): NavigationStack {
  if (typeof localStorage === 'undefined') return defaultStack()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStack()
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as NavigationStack).entries)
    ) {
      const entries = (parsed as NavigationStack).entries.filter(isEntry)
      if (entries.length > 0) {
        return { entries: entries.map(normalizeEntry) }
      }
    }
  } catch {
    /* corrupt / private mode */
  }
  return defaultStack()
}

export function writeNavigationStack(stack: NavigationStack): void {
  if (typeof localStorage === 'undefined') return
  try {
    const entries = stack.entries.slice(-MAX_STACK_DEPTH).map(normalizeEntry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries }))
  } catch {
    /* ignore */
  }
}

export function clearNavigationStack(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function pushEntry(
  stack: NavigationStack,
  view: AppView,
  params: Record<string, string> = {},
): NavigationStack {
  const top = stack.entries[stack.entries.length - 1]
  const next: NavigationEntry = { view, params: { ...params } }
  if (
    top &&
    top.view === next.view &&
    paramsEqual(top.params, next.params)
  ) {
    return stack
  }
  const trimmed = stack.entries.slice(-MAX_STACK_DEPTH + 1)
  return { entries: [...trimmed, next] }
}

export function popEntry(stack: NavigationStack): NavigationStack {
  if (stack.entries.length <= 1) return stack
  return { entries: stack.entries.slice(0, -1) }
}

export function replaceTop(
  stack: NavigationStack,
  view: AppView,
  params: Record<string, string> = {},
): NavigationStack {
  const entries =
    stack.entries.length === 0
      ? []
      : stack.entries.slice(0, -1)
  return { entries: [...entries, { view, params: { ...params } }] }
}

export function topEntry(stack: NavigationStack): NavigationEntry {
  return stack.entries[stack.entries.length - 1] ?? {
    view: DEFAULT_VIEW,
    params: EMPTY_PARAMS,
  }
}

function paramsEqual(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false
  }
  return true
}
