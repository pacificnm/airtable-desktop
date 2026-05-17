import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import type { AppView } from './appView.ts'
import { screenImporters } from '../../config/screens.ts'

/** One lazy screen per registered route — core + enabled modules. */
const screens = Object.fromEntries(
  Object.entries(screenImporters).map(([id, importer]) => [
    id,
    lazy(importer),
  ]),
) as Record<string, LazyExoticComponent<ComponentType>>

export interface ScreenRouterProps {
  view: AppView
}

export function ScreenRouter({ view }: ScreenRouterProps) {
  const Active = screens[view]

  if (!Active) {
    return (
      <Typography color="error" role="alert">
        Unknown screen: {view}
      </Typography>
    )
  }

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      }
    >
      <Active />
    </Suspense>
  )
}
