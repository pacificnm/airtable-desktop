import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ScreensRoutesSection() {
  return (
    <DocSection title="Screens & routes" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <strong>Modules (recommended):</strong> declare <Code>screens</Code> and{' '}
        <Code>menuItems</Code> in <Code>modules/&lt;id&gt;/index.ts</Code> — core
        registers routes and navigation automatically. See Documentation → Modules.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <strong>Core screens only:</strong> use Documentation → Scaffold a screen (or
        Developer → Tables) for patches, or wire manually:
      </Typography>
      <List dense disablePadding>
        <ListItem>
          <ListItemText
            primary={<Code>src/components/main/appView.ts</Code>}
            secondary='Add your view id, e.g. "myFeature".'
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<Code>src/config/screens.ts</Code>}
            secondary="Title + lazy import for src/screens/MyFeature.tsx."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<Code>src/config/menu.ts</Code>}
            secondary="Menu item under the right section."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<Code>src/config/tabs.ts</Code>}
            secondary="Optional top bar tabs (leave empty if you only use the drawer)."
          />
        </ListItem>
      </List>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Set <Code>screens: ['myFeature']</Code> on the table config if you use{' '}
        <Code>getTableForView</Code>.
      </Typography>
    </DocSection>
  )
}
