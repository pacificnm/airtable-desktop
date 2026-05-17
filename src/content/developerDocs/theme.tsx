import Typography from '@mui/material/Typography'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ThemeSection() {
  return (
    <DocSection title="Theme & tokens" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <strong>CSS tokens</strong> — edit <Code>src/tokens.css</Code>; preview under
        Tokens & theme in the menu.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <strong>MUI theme</strong> — edit <Code>src/theme.ts</Code>; preview components
        on the MUI theme screen. Prefer theme tokens over hard-coded colors in new UI.
      </Typography>
    </DocSection>
  )
}
