import { useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { useToast } from '@/hooks/useToast.ts'
import {
  getElectronFilesBridge,
  type ImportDataFileSuccess,
} from '@/lib/files/electronFilesBridge.ts'

export interface UploadDataFileButtonProps {
  /** Module id (lowercased, kebab-case). Used to namespace the temp directory. */
  moduleId: string
  /** Optional label override. Defaults to "Upload Data File". */
  label?: string
  /** Disable the button (e.g. while data is loading). */
  disabled?: boolean
  /** Called after a successful import — receives the saved file metadata. */
  onUploaded?: (result: ImportDataFileSuccess) => void
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exp = Math.min(units.length - 1, Math.floor(Math.log10(bytes) / 3))
  const value = bytes / 1000 ** exp
  return `${value.toFixed(value >= 10 || exp === 0 ? 0 : 1)} ${units[exp]}`
}

/**
 * Secondary header action that lets users import a client-supplied CSV
 * data file into a per-module working directory under the app's userData
 * folder. Hidden when not running inside Electron (no IPC bridge available).
 */
export function UploadDataFileButton({
  moduleId,
  label = 'Upload Data File',
  disabled = false,
  onUploaded,
}: UploadDataFileButtonProps) {
  const toast = useToast()
  const bridge = useMemo(() => getElectronFilesBridge(), [])
  const [importing, setImporting] = useState(false)

  if (!bridge) {
    return (
      <Tooltip title="Available in the desktop app only">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileUploadOutlinedIcon />}
            disabled
          >
            {label}
          </Button>
        </span>
      </Tooltip>
    )
  }

  const handleClick = async () => {
    setImporting(true)
    try {
      const result = await bridge.importDataFile(moduleId)
      if (result.ok) {
        toast.success(
          `Imported "${result.originalName}" (${formatBytes(result.size)})`,
        )
        onUploaded?.(result)
        return
      }
      if (result.cancelled) return
      toast.error(result.error ?? 'Failed to import data file.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import data file.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={
        importing ? (
          <CircularProgress size={14} color="inherit" aria-hidden />
        ) : (
          <FileUploadOutlinedIcon />
        )
      }
      disabled={disabled || importing}
      onClick={() => void handleClick()}
    >
      {label}
    </Button>
  )
}
