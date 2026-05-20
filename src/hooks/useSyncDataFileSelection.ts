import { useMemo, useState } from 'react'
import type { DataFileEntry } from '@/lib/files/electronFilesBridge.ts'
import { useDataFiles } from './useDataFiles.ts'

function preferredDataFileName(
  moduleId: string,
  files: readonly DataFileEntry[],
): string | undefined {
  if (files.length === 0) return undefined

  if (moduleId === 'space') {
    const spaceExport = files.find((file) =>
      /location_space/i.test(file.name),
    )
    if (spaceExport) return spaceExport.name
  }

  if (moduleId === 'location') {
    const buildingExport = files.find(
      (file) =>
        /location_current/i.test(file.name) && !/location_space/i.test(file.name),
    )
    if (buildingExport) return buildingExport.name
  }

  return files[0].name
}

export interface UseSyncDataFileSelectionOptions {
  /** When false, selection is not reset when the file list changes. */
  active?: boolean
}

/**
 * Picks which uploaded CSV to read for sync. Defaults to the newest file
 * (`modifiedAt` desc from `listDataFiles`) and keeps the choice if it still exists.
 */
export function useSyncDataFileSelection(
  moduleId: string,
  { active = true }: UseSyncDataFileSelectionOptions = {},
) {
  const dataFiles = useDataFiles(moduleId)
  const [userFileName, setSelectedFileName] = useState<string | undefined>()

  const defaultFileName = useMemo(
    () => preferredDataFileName(moduleId, dataFiles.files),
    [moduleId, dataFiles.files],
  )

  const fileNames = useMemo(
    () => dataFiles.files.map((file) => file.name),
    [dataFiles.files],
  )

  const selectedFileName = useMemo(() => {
    if (!active || fileNames.length === 0) return undefined
    if (userFileName && fileNames.includes(userFileName)) return userFileName
    return defaultFileName
  }, [active, fileNames, userFileName, defaultFileName])

  const selectedFile = dataFiles.files.find((file) => file.name === selectedFileName)

  return {
    ...dataFiles,
    selectedFileName,
    selectedFile,
    setSelectedFileName,
    ready: Boolean(selectedFileName) && !dataFiles.isLoading,
  }
}
