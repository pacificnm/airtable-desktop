import Chip, { type ChipProps } from '@mui/material/Chip'

export interface LabelChipProps extends ChipProps {
  label: string
}

/** Small outlined tag (type, action, category). */
export function LabelChip({ label, size = 'small', variant = 'outlined', ...props }: LabelChipProps) {
  return <Chip label={label} size={size} variant={variant} {...props} />
}
