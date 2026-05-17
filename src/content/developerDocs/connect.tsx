import Typography from '@mui/material/Typography'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ConnectSection() {
  return (
    <DocSection title="Connect your base" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Open the menu → <strong>Airtable connection</strong>. You can paste a{' '}
        <strong>personal access token</strong> or use <strong>OAuth</strong> (see the{' '}
        <strong>OAuth setup</strong> doc in the sidebar for full Airtable + app configuration).
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        You need read/write access to your base and <Code>schema.bases:read</Code> for
        Developer → Tables lookups. Optional: <Code>user.email:read</Code> for the avatar
        display name when using OAuth.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Connection state is stored locally (Electron). The renderer uses{' '}
        <Code>useAirtable()</Code> for the REST client and <Code>isReady</Code>. Repo guide:{' '}
        <Code>docs/oauth-setup.md</Code>.
      </Typography>
    </DocSection>
  )
}
