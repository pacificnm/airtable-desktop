import Typography from '@mui/material/Typography'
import { DocSection } from '../../components/developer/docs/docPrimitives.tsx'

export function ConnectionProfilesSection() {
  return (
    <DocSection title="Connection profiles" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use named profiles for Dev / Prod (or any bases) without retyping credentials.
        Each profile stores its own <strong>base id</strong> and optional{' '}
        <strong>PAT</strong>; OAuth tokens are saved on the profile you used to sign in.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Switch from the <strong>avatar menu</strong> or the profile dropdown in{' '}
        <strong>Airtable connection</strong>. Adding or switching profiles clears cached
        API data so lists do not leak between bases.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Reference: <code>docs/connection-profiles.md</code>
      </Typography>
    </DocSection>
  )
}
