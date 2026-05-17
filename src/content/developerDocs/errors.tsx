import Typography from '@mui/material/Typography'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ErrorsSection() {
  return (
    <DocSection title="Error handling" hideTitle>
      <Typography variant="body2" color="text.secondary">
        React error boundaries catch render failures: a root boundary in{' '}
        <Code>main.tsx</Code> and a content boundary around <Code>ScreenRouter</Code>{' '}
        (header and menu stay visible). The error screen offers <strong>Try again</strong>{' '}
        and <strong>Reload app</strong>; details and stack traces appear in development
        builds.
      </Typography>
    </DocSection>
  )
}
