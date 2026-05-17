import Chip, { type ChipProps } from '@mui/material/Chip'

export interface StatusChipProps extends Omit<ChipProps, 'label' | 'color' | 'variant'> {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}

/** Yes/No active indicator used in list tables. */
export function StatusChip({
  active,
  activeLabel = 'Yes',
  inactiveLabel = 'No',
  size = 'small',
  ...props
}: StatusChipProps) {
  return (
    <Chip
      label={active ? activeLabel : inactiveLabel}
      size={size}
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      {...props}
    />
  )
}
