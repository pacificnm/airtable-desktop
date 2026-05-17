import Typography from '@mui/material/Typography'
import { DocSection } from '../../components/developer/docs/docPrimitives.tsx'

export function OverviewSection() {
  return (
    <DocSection title="Overview" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This starter is an Airtable-backed Electron shell. Connect a base, then build
        product features as <strong>modules</strong> under <code>modules/</code> (see
        Documentation → Modules) or add one-off screens under <code>src/screens/</code>.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use the menu on the left to jump between topics. Repo copies of some guides
        also live under <code>docs/</code> (for example <code>docs/modules.md</code>,{' '}
        <code>docs/toast.md</code>).
      </Typography>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
        Tip: enable the <code>config</code> module, connect Airtable, enable your feature
        module in Developer → Modules, then implement one list screen with the shared UI
        kit before filters and advanced flows.
      </Typography>
    </DocSection>
  )
}
