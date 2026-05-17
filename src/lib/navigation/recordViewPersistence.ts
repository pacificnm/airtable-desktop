import type { RecordViewMode } from '../../components/ui/record/recordTypes.ts'

const STORAGE_PREFIX = 'recordView.v1'

export function recordViewStorageKey(screenId: string): string {
  return `${STORAGE_PREFIX}.${screenId}`
}

export function isRecordViewMode(value: string): value is RecordViewMode {
  return value === 'grid' || value === 'card'
}

export function readRecordViewMode(
  screenId: string,
  defaultMode: RecordViewMode = 'grid',
): RecordViewMode {
  try {
    const raw = localStorage.getItem(recordViewStorageKey(screenId))
    if (raw && isRecordViewMode(raw)) return raw
  } catch {
    /* private mode / quota */
  }
  return defaultMode
}

export function writeRecordViewMode(screenId: string, mode: RecordViewMode): void {
  try {
    localStorage.setItem(recordViewStorageKey(screenId), mode)
  } catch {
    /* ignore */
  }
}
