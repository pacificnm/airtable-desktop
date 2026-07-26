import Box, { type BoxProps } from '@mui/material/Box'

export type FormStackProps = Omit<BoxProps, 'spacing'> & {
  spacing?: number
}

/** Standard vertical spacing for drawer forms. */
export function FormStack({ spacing = 2, sx, onSubmit, ...props }: FormStackProps) {
  return (
    <Box
      component="form"
      noValidate
      onSubmit={
        onSubmit ??
        ((event) => {
          // No caller-supplied handler: still stop the native implicit submit (Enter key)
          // from navigating/reloading the Electron window.
          event.preventDefault()
        })
      }
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing,
        ...sx,
      }}
      {...props}
    />
  )
}
