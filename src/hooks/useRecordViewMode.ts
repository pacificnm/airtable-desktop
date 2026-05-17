import { useCallback, useState } from 'react'
import type { RecordViewMode } from '../components/ui/record/recordTypes.ts'
import {
  readRecordViewMode,
  writeRecordViewMode,
} from '../lib/navigation/recordViewPersistence.ts'

/**
 * Grid vs card layout for a list screen, persisted in localStorage per `screenId`.
 * Use the screen’s {@link AppView} id (e.g. `configList`, `rolesList`) or `list:<tableKey>`.
 */
export function useRecordViewMode(
  screenId: string,
  defaultMode: RecordViewMode = 'grid',
): [RecordViewMode, (mode: RecordViewMode) => void] {
  const [viewMode, setViewModeState] = useState<RecordViewMode>(() =>
    readRecordViewMode(screenId, defaultMode),
  )

  const setViewMode = useCallback(
    (mode: RecordViewMode) => {
      setViewModeState(mode)
      writeRecordViewMode(screenId, mode)
    },
    [screenId],
  )

  return [viewMode, setViewMode]
}
