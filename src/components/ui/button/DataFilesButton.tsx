import { useEffect, useRef, useState } from 'react'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import { useDataFiles } from '@/hooks/useDataFiles.ts'
import { DataFilesDialog } from '../dialog/DataFilesDialog.tsx'

export interface DataFilesButtonProps {
  /** Module id (lowercased, kebab-case). Namespaces the working directory. */
  moduleId: string
  /** Override the dialog title. Defaults to "Data Files". */
  dialogTitle?: string
  /** Override the button label. Defaults to "Data Files". */
  label?: string
  /** Disable interaction (e.g. while a parent screen is busy). */
  disabled?: boolean
  /**
   * Optional bump counter from the parent — incrementing it causes the
   * button to refresh its file list (e.g. right after a new upload).
   */
  refreshKey?: number
}

/**
 * Header-area launcher that opens a dialog of imported working data files
 * for `moduleId`, with per-file delete actions.
 */
export function DataFilesButton({
  moduleId,
  dialogTitle,
  label = 'Data Files',
  disabled = false,
  refreshKey,
}: DataFilesButtonProps) {
  const [open, setOpen] = useState(false)
  const dataFiles = useDataFiles(moduleId)

  useRefreshOnKeyChange(refreshKey, dataFiles.refresh)

  return (
    <>
      <Tooltip
        title={
          dataFiles.bridgeMissing
            ? 'Available in the desktop app only'
            : 'Manage uploaded data files'
        }
      >
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={
              <Badge
                badgeContent={dataFiles.files.length}
                color="primary"
                max={99}
                invisible={dataFiles.files.length === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    right: -6,
                    top: -2,
                    height: 16,
                    minWidth: 16,
                    fontSize: '0.625rem',
                  },
                }}
              >
                <FolderOpenOutlinedIcon />
              </Badge>
            }
            disabled={disabled || dataFiles.bridgeMissing}
            onClick={() => setOpen(true)}
          >
            {label}
          </Button>
        </span>
      </Tooltip>

      <DataFilesDialog
        open={open}
        onClose={() => setOpen(false)}
        title={dialogTitle}
        files={dataFiles.files}
        isLoading={dataFiles.isLoading}
        isRefreshing={dataFiles.isRefreshing}
        error={dataFiles.error}
        bridgeMissing={dataFiles.bridgeMissing}
        onRefresh={dataFiles.refresh}
        onDelete={dataFiles.deleteFile}
      />
    </>
  )
}

function useRefreshOnKeyChange(
  refreshKey: number | undefined,
  refresh: () => Promise<void>,
) {
  const lastKey = useRef(refreshKey)
  useEffect(() => {
    if (refreshKey === undefined) return
    if (lastKey.current === refreshKey) return
    lastKey.current = refreshKey
    void refresh()
  }, [refreshKey, refresh])
}
