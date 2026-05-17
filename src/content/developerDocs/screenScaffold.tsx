import Typography from '@mui/material/Typography'
import { DocSection } from '../../components/developer/docs/docPrimitives.tsx'
import { ScreenScaffoldPanel } from '../../components/developer/ScreenScaffoldPanel.tsx'

export function ScreenScaffoldSection() {
  return (
    <DocSection title="Scaffold a screen" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Generate a <code>PageContainer</code> list screen plus patches for{' '}
        <code>appView.ts</code>, <code>screens.ts</code>, <code>menu.ts</code>, and{' '}
        <code>tables.ts</code>. Default output uses the shared <strong>ListScreen</strong>{' '}
        template (columns from config; no CRUD hook required). Use after table config is
        in place. Also at the bottom of <strong>Developer → Tables</strong> when you open
        a table.
      </Typography>
      <ScreenScaffoldPanel />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Reference: <code>docs/scaffold-screen.md</code>
      </Typography>
    </DocSection>
  )
}
