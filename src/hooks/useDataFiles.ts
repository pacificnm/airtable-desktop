import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getElectronFilesBridge,
  type DataFileEntry,
} from '@/lib/files/electronFilesBridge.ts'

const QUERY_PREFIX = ['electron', 'data-files'] as const

function dataFilesQueryKey(moduleId: string): readonly unknown[] {
  return [...QUERY_PREFIX, moduleId]
}

export interface UseDataFilesResult {
  /** Files sorted by `modifiedAt` desc (newest first). Empty when bridge is missing. */
  files: DataFileEntry[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  /** True when running outside Electron — calls become no-ops. */
  bridgeMissing: boolean
  /** Refetch the listing. */
  refresh: () => Promise<void>
  /** Removes a file by name and invalidates the listing. */
  deleteFile: (fileName: string) => Promise<{ ok: boolean; error?: string }>
}

/**
 * Loads (and lets the caller refresh / delete) the working data files
 * imported for `moduleId` via the Electron `electronFiles` IPC bridge.
 *
 * Browser dev (no IPC) returns an empty list and exposes `bridgeMissing`
 * so callers can render a "desktop only" affordance without erroring.
 */
export function useDataFiles(moduleId: string): UseDataFilesResult {
  const bridge = useMemo(() => getElectronFilesBridge(), [])
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: dataFilesQueryKey(moduleId),
    enabled: !!bridge,
    staleTime: 30 * 1000,
    queryFn: async (): Promise<DataFileEntry[]> => {
      if (!bridge) return []
      const res = await bridge.listDataFiles(moduleId)
      if (!res.ok) throw new Error(res.error)
      return res.files
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string): Promise<void> => {
      if (!bridge) throw new Error('Desktop app required')
      const res = await bridge.deleteDataFile(moduleId, fileName)
      if (!res.ok) throw new Error(res.error)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: dataFilesQueryKey(moduleId) })
    },
  })

  const refresh = useCallback(async (): Promise<void> => {
    if (!bridge) return
    await queryClient.invalidateQueries({ queryKey: dataFilesQueryKey(moduleId) })
  }, [bridge, queryClient, moduleId])

  const deleteFile = useCallback(
    async (fileName: string): Promise<{ ok: boolean; error?: string }> => {
      if (!bridge) return { ok: false, error: 'Desktop app required' }
      try {
        await deleteMutation.mutateAsync(fileName)
        return { ok: true }
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Failed to delete file',
        }
      }
    },
    [bridge, deleteMutation],
  )

  return {
    files: query.data ?? [],
    isLoading: !!bridge && query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
    bridgeMissing: !bridge,
    refresh,
    deleteFile,
  }
}
