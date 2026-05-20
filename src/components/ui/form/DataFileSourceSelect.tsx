import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import type { DataFileEntry } from '@/lib/files/electronFilesBridge.ts'
import { FormSelect } from './FormSelect.tsx'

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exp = Math.min(units.length - 1, Math.floor(Math.log10(bytes) / 3))
  const value = bytes / 1000 ** exp
  return `${value.toFixed(value >= 10 || exp === 0 ? 0 : 1)} ${units[exp]}`
}

function formatTimestamp(ms: number): string {
  try {
    return new Date(ms).toLocaleString()
  } catch {
    return ''
  }
}

export interface DataFileSourceSelectProps {
  files: readonly DataFileEntry[]
  value: string
  onChange: (fileName: string) => void
  disabled?: boolean
  /** Shown under the select when multiple files exist. */
  hint?: string
}

export function DataFileSourceSelect({
  files,
  value,
  onChange,
  disabled = false,
  hint,
}: DataFileSourceSelectProps) {
  if (files.length === 0) return null

  return (
    <>
      <FormSelect
        label="Data file"
        labelId="data-file-sync-source"
        value={value}
        onChange={onChange}
        disabled={disabled || files.length <= 1}
        fullWidth
      >
        {files.map((file) => (
          <MenuItem key={file.name} value={file.name}>
            {file.name} ({formatBytes(file.size)}, {formatTimestamp(file.modifiedAt)})
          </MenuItem>
        ))}
      </FormSelect>
      {hint && files.length > 1 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {hint}
        </Typography>
      ) : null}
    </>
  )
}
