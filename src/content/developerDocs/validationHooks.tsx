import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ValidationHooksSection() {
  return (
    <DocSection title="Validation & hooks" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        From the table flyout in Developer → Tables, copy three snippets:
      </Typography>
      <List dense disablePadding>
        <ListItem>
          <ListItemText
            primary="Zod schemas"
            secondary="Paste into src/validation/YourTable.ts — create, patch, and record shapes."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="CRUD hook"
            secondary="Paste into src/hooks/useYourTable.ts — list, get, create, update, remove with normalizeRecord."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Query hooks (TanStack Query)"
            secondary="Append to the same file — cached list/record queries and mutations with cache invalidation."
          />
        </ListItem>
      </List>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Hooks call <Code>getTableConfig('yourKey')</Code> and validate with Zod before
        writes. Tighten required fields in table config <Code>validation</Code> or edit
        the generated schema after paste.
      </Typography>
    </DocSection>
  )
}
