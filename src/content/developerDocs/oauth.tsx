import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  Code,
  DocPre,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

function Subheading({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 600, color: 'primary.dark', mt: 2.5, mb: 1 }}
    >
      {children}
    </Typography>
  )
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <Box component="ul" sx={{ m: 0, mb: 2, pl: 2.5, color: 'text.secondary' }}>
      {items.map((item) => (
        <Typography
          key={item}
          component="li"
          variant="body2"
          color="text.secondary"
          sx={{ mb: 0.75 }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  )
}

export function OAuthSetupSection() {
  return (
    <DocSection title="OAuth setup" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        OAuth 2.0 with <strong>PKCE</strong> lets users sign in instead of pasting a PAT.
        You configure an integration in <strong>Airtable</strong> and matching variables in{' '}
        <Code>.env</Code>. Tokens are stored on the active{' '}
        <strong>connection profile</strong>.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Full guide (same content, easy to share): <Code>docs/oauth-setup.md</Code> in the
        repo. API reference:{' '}
        <a
          href="https://airtable.com/developers/web/api/oauth-reference"
          target="_blank"
          rel="noreferrer"
        >
          Airtable OAuth
        </a>
        .
      </Typography>

      <Subheading>Part 1 — Airtable (integration settings)</Subheading>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <strong>1. Create an integration</strong> — open{' '}
        <a href="https://airtable.com/create/oauth" target="_blank" rel="noreferrer">
          airtable.com/create/oauth
        </a>{' '}
        (or Builder hub → Integrations). Copy the <strong>Client ID</strong>.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <strong>2. Redirect URLs</strong> — register a URL that matches your app{' '}
        <em>exactly</em> (scheme, host, port, trailing slash):
      </Typography>
      <BulletList
        items={[
          'npm run electron:dev → http://127.0.0.1:5173/ (recommended)',
          'npm run dev (browser) → same URL as VITE_AIRTABLE_OAUTH_REDIRECT_URI',
          'Do not mix localhost and 127.0.0.1 unless both are registered',
        ]}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <strong>3. Scopes</strong> — enable on the integration, then list the same ids in{' '}
        <Code>.env</Code> (space-separated):
      </Typography>
      <DocPre>{`Minimum for this starter:
  data.records:read     — list / read records
  data.records:write    — create / update / delete
  schema.bases:read     — Developer → Tables (schema lookup)

Recommended:
  user.email:read       — avatar / whoami display name`}</DocPre>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <strong>4. Client type</strong> — <em>Public</em> + PKCE (default): no secret.
        <em> Confidential</em>: set <Code>VITE_AIRTABLE_OAUTH_CLIENT_SECRET</Code> in{' '}
        <Code>.env</Code> (never commit); Electron sends Basic auth on token exchange.
      </Typography>

      <Subheading>Part 2 — App (.env)</Subheading>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Copy <Code>.env.example</Code> to <Code>.env</Code> and set:
      </Typography>
      <DocPre>{`VITE_AIRTABLE_OAUTH_CLIENT_ID=your_client_id
VITE_AIRTABLE_OAUTH_REDIRECT_URI=http://127.0.0.1:5173/
VITE_AIRTABLE_OAUTH_SCOPES=data.records:read data.records:write schema.bases:read user.email:read

# Optional defaults
VITE_AIRTABLE_BASE_ID=appXXXXXXXX

# Confidential clients only
# VITE_AIRTABLE_OAUTH_CLIENT_SECRET=your_secret`}</DocPre>
      <BulletList
        items={[
          'Restart the dev server after editing .env',
          'Use npm run electron:dev so token exchange runs in the main process (no CORS)',
          'npm run dev uses a Vite proxy for /__airtable_oauth/v1/token instead',
        ]}
      />

      <Subheading>Part 3 — Sign in</Subheading>
      <BulletList
        items={[
          'Menu (☰) → Airtable connection',
          'Enter Base ID (app… from airtable.com/appXXXXXXXX/…)',
          'Sign in with OAuth → complete Airtable login → redirect back',
          'Save — connection should show Connected (OAuth)',
          'Sign out OAuth clears tokens on the active profile only',
        ]}
      />

      <Subheading>How the flow works</Subheading>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The app builds an authorize URL with <Code>code_challenge</Code> (S256), stores
        PKCE verifier + state in <Code>localStorage</Code>, then on redirect exchanges the
        code via <Code>electron/main.ts</Code> (IPC). Access tokens refresh automatically
        before expiry. A saved PAT on the profile overrides OAuth for API calls.
      </Typography>

      <Subheading>Troubleshooting</Subheading>
      <DocPre>{`redirect_uri mismatch → URL in Airtable must match VITE_AIRTABLE_OAUTH_REDIRECT_URI exactly
invalid_scope       → enable scope in Airtable + add to VITE_AIRTABLE_OAUTH_SCOPES
CORS on token       → use npm run electron:dev, not browser-only dev
OAuth not configured → set CLIENT_ID, REDIRECT_URI, SCOPES; restart Vite`}</DocPre>
      <Typography variant="body2" color="text.secondary">
        Inspect failures in the debug panel → Network tab (when debug mode is on).
      </Typography>
    </DocSection>
  )
}
