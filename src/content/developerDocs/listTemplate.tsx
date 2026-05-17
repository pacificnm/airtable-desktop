import Typography from '@mui/material/Typography'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ListTemplateSection() {
  return (
    <DocSection title="List screen template" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <Code>ListScreen</Code> in <Code>src/components/list/ListScreen.tsx</Code> is a
        reusable list page: it reads <Code>columns</Code> from <Code>tables.ts</Code>,
        loads rows with <Code>useAirtableListQuery</Code>, and uses shared{' '}
        <Code>InlineError</Code> (with retry) and <Code>EmptyState</Code> for failures
        and empty lists. No generated CRUD hook is required for read-only lists.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Example copy source: <Code>src/screens/_template/ListScreen.tsx</Code>.
        Scaffold a screen (default mode) generates a thin wrapper:
      </Typography>
      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: 'grey.100', p: 1.5, borderRadius: 1 }}>
        {`import { ListScreen } from '../components/list/ListScreen.tsx'

export default function MyTable() {
  return <ListScreen tableKey="myTable" title="My table" />
}`}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Customize by forking the template or passing children later; swap in your own
        table component while keeping <Code>PageContainer</Code> / header patterns.
        Reference: <Code>docs/list-screen-template.md</Code>.
      </Typography>
    </DocSection>
  )
}
