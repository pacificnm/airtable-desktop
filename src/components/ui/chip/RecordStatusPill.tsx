import Box from '@mui/material/Box'
import Chip, { type ChipProps } from '@mui/material/Chip'
import { normalizeRecordStatus, type KnownRecordStatus } from './recordStatus.ts'

const STATUS_STYLES: Record<
  KnownRecordStatus,
  { color: NonNullable<ChipProps['color']>; variant: NonNullable<ChipProps['variant']> }
> = {
  Active: { color: 'success', variant: 'filled' },
  Deleted: { color: 'error', variant: 'filled' },
}

export interface RecordStatusPillProps
  extends Omit<ChipProps, 'label' | 'color' | 'variant'> {
  status?: string | null
  /** How to render values that are not Active or Deleted. */
  fallback?: 'raw' | 'dash' | 'none'
}

/** Shared pill for Active / Deleted record status (Country, State, etc.). */
export function RecordStatusPill({
  status,
  fallback = 'dash',
  size = 'small',
  ...props
}: RecordStatusPillProps) {
  const normalized = normalizeRecordStatus(status)

  if (normalized) {
    const style = STATUS_STYLES[normalized]
    return (
      <Chip
        label={normalized}
        size={size}
        color={style.color}
        variant={style.variant}
        {...props}
      />
    )
  }

  if (fallback === 'none') return null

  const raw = status?.trim()
  if (fallback === 'raw' && raw) {
    return <Chip label={raw} size={size} variant="outlined" {...props} />
  }

  return (
    <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
      —
    </Box>
  )
}
