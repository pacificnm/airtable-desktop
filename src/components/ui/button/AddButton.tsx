import AddIcon from '@mui/icons-material/Add'
import { Action, type ActionProps } from '../../button/Action.tsx'

export type AddButtonProps = Omit<ActionProps, 'startIcon'>

/** Primary header action with plus icon (New …). */
export function AddButton({ children, ...props }: AddButtonProps) {
  return (
    <Action startIcon={<AddIcon />} {...props}>
      {children}
    </Action>
  )
}
