import Button, { type ButtonProps } from '@mui/material/Button'

export type TextButtonProps = ButtonProps

/** Secondary cancel / dismiss control (toolbar, dialogs, drawers). */
export function TextButton({ color = 'inherit', children, ...props }: TextButtonProps) {
  return (
    <Button color={color} {...props}>
      {children}
    </Button>
  )
}
