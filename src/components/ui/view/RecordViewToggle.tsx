import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import type { RecordViewMode } from '../record/recordTypes.ts'

export interface RecordViewToggleProps {
  value: RecordViewMode
  onChange: (mode: RecordViewMode) => void
  disabled?: boolean
}

/** Switch between grid (table) and card record layouts. */
export function RecordViewToggle({ value, onChange, disabled }: RecordViewToggleProps) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      disabled={disabled}
      onChange={(_, next: RecordViewMode | null) => {
        if (next != null) onChange(next)
      }}
      aria-label="Record view"
    >
      <ToggleButton value="grid" aria-label="Grid view">
        <Tooltip title="Grid view">
          <GridViewIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="card" aria-label="Card view">
        <Tooltip title="Card view">
          <ViewModuleIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
