import Typography from '@mui/material/Typography'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function DebugSection() {
  return (
    <DocSection title="Debug panel" hideTitle>
      <Typography variant="body2" color="text.secondary">
        Use the bug button in the bottom-right corner to open a slide-up panel with
        network requests, captured errors, and basic performance metrics. All{' '}
        <Code>fetch</Code> calls are logged automatically. In development, expand a
        network row to inspect request/response headers and bodies (Authorization is
        redacted). Use <strong>Copy</strong> on request/response blocks or{' '}
        <strong>Copy all</strong> on a row. Filter by URL substring and status class.
        Enable <strong>Clear on navigate</strong> in the panel header to reset network
        and errors when you change screens. Airtable API calls retry on <strong>429</strong>{' '}
        and <strong>503</strong> with backoff; rows show a <Code>requestId</Code>, retry
        attempt, and any <Code>Retry-After</Code> / rate-limit headers. The Errors tab shows
        the message, a highlighted{' '}
        <Code>src/…</Code> file location when available, the source channel, and an
        expandable stack trace (app frames emphasized over <Code>node_modules</Code>).
      </Typography>
    </DocSection>
  )
}
