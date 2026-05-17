import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function RegisterTablesSection() {
  return (
    <DocSection title="Register tables" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        In <strong>Developer → Tables</strong>, look up a table by id (e.g.{' '}
        <Code>tblXXXXXXXX</Code>). Copy the generated snippet into{' '}
        <Code>src/config/tables.ts</Code> inside <Code>coreAirtableTables</Code>, or
        in a module’s <Code>modules/&lt;id&gt;/tables.ts</Code> (see Documentation →
        Modules — preferred for product features).
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Each entry maps your code keys to Airtable field names, optional views, list
        defaults, and which app screens use the table via <Code>screens</Code>.
      </Typography>
      <List dense disablePadding sx={{ listStyle: 'decimal', pl: 2.5 }}>
        <ListItem sx={{ display: 'list-item', py: 0.25 }}>
          <ListItemText
            primary={
              <>
                <Code>key</Code> — stable id for hooks (<Code>useMyTable</Code>)
              </>
            }
          />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.25 }}>
          <ListItemText
            primary={
              <>
                <Code>fields</Code> — camelCase → Airtable column names
              </>
            }
          />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.25 }}>
          <ListItemText
            primary={
              <>
                <Code>views</Code> — optional Airtable view names; use{' '}
                <Code>getViewForScreen(table, 'grid' | 'card' | 'kanban')</Code> or{' '}
                <Code>getAirtableViewForRecordMode(table, 'grid' | 'card')</Code>
              </>
            }
          />
        </ListItem>
      </List>
    </DocSection>
  )
}
