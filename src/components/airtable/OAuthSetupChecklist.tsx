import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { readAirtableEnv } from '../../lib/airtable/env.ts'
import { getOAuthSetupStatus } from '../../lib/airtable/oauthSetup.ts'

export function OAuthSetupChecklist() {
  const [copied, setCopied] = useState(false)
  const setup = useMemo(
    () => getOAuthSetupStatus(readAirtableEnv(), window.location.origin),
    [],
  )

  const copyRedirect = async () => {
    if (!setup.redirectUri) return
    await navigator.clipboard.writeText(setup.redirectUri)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (setup.blockers.length > 0) {
    return (
      <Alert severity="error">
        {setup.blockers.map((line) => (
          <Typography key={line} variant="body2" sx={{ display: 'block' }}>
            {line}
          </Typography>
        ))}
      </Alert>
    )
  }

  return (
    <Alert severity="info">
      <Typography variant="body2" sx={{ mb: 1 }}>
        If Airtable shows &quot;failed to construct a request&quot;, the integration
        settings usually do not match the app. Open{' '}
        <Link
          href="https://airtable.com/create/oauth"
          target="_blank"
          rel="noopener noreferrer"
        >
          airtable.com/create/oauth
        </Link>{' '}
        → your integration:
      </Typography>
      <Box
        component="ul"
        sx={{ m: 0, pl: 2.5, '& li': { typography: 'body2', mb: 0.5 } }}
      >
        {setup.reminders.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </Box>
      {setup.redirectUri ? (
        <Box
          sx={{
            mt: 1.5,
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            wordBreak: 'break-all',
          }}
        >
          {setup.redirectUri}
        </Box>
      ) : null}
      <Button size="small" sx={{ mt: 1 }} onClick={() => void copyRedirect()}>
        {copied ? 'Copied' : 'Copy redirect URL'}
      </Button>
    </Alert>
  )
}
