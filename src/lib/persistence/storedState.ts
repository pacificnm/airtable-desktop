/**
 * Tiny JSON-backed localStorage helpers with optional validation.
 * Designed for view-state persistence (filters, sort, pagination, etc.).
 * Failures (private mode, quota, corrupt JSON) silently fall back to the default.
 */

export type Validator<T> = (value: unknown) => value is T

export interface StoredStateOptions<T> {
  /** Only writes if the value passes this check (defaults to "any object"). */
  validate?: Validator<T>
}

function safeParse(raw: string | null): unknown {
  if (raw == null) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
}

export function readStoredState<T>(
  key: string,
  fallback: T,
  options: StoredStateOptions<T> = {},
): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const parsed = safeParse(localStorage.getItem(key))
    if (parsed === undefined) return fallback
    if (options.validate && !options.validate(parsed)) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

export function writeStoredState<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / quota */
  }
}

export function removeStoredState(key: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Build a storage key like `filters.v1.locationsList.appXYZ`. */
export function buildStorageKey(
  namespace: string,
  ...segments: readonly (string | undefined | null)[]
): string {
  return [namespace, ...segments.filter((s): s is string => Boolean(s?.trim()))].join('.')
}
