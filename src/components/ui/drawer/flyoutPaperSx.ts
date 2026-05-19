import type { SystemStyleObject } from '@mui/system'
import type { Theme } from '@mui/material/styles'

/**
 * Shared styling for right-anchored content flyouts (FormDrawer, detail
 * flyouts, sync drawers). Adds a subtle inset border, soft shadow, and
 * rounded left corners so the panel reads as a surface that's "popped out"
 * over the page rather than blending into the viewport edge.
 *
 * Returns a `SystemStyleObject` so it can be used directly as
 * `slotProps.paper.sx`, or spread into a larger sx object when a caller
 * needs to add per-instance overrides (e.g. width).
 */
export const flyoutPaperSx = (theme: Theme): SystemStyleObject<Theme> => ({
  borderLeft: '1px solid',
  borderBottom: '1px solid',
  borderColor: 'divider',
  // 3px brand-green top edge separates the flyout from the app toolbar so it
  // never visually blends into the header chrome.
  borderTop: '3px solid var(--app-chrome-bg)',
  borderRadius: 0,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 8px 20px -6px rgba(0, 0, 0, 0.45)'
      : '0 24px 48px -12px rgba(15, 23, 42, 0.18), 0 8px 20px -6px rgba(15, 23, 42, 0.10)',
})
