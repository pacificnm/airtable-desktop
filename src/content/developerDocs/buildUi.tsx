import Typography from '@mui/material/Typography'
import {
  Code,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function BuildUiSection() {
  return (
    <DocSection title="Build the UI" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        For modules, create <Code>modules/&lt;id&gt;/screens/MyListScreen.tsx</Code> and
        use <Code>RecordListPage</Code>, <Code>RecordCollectionView</Code>,{' '}
        <Code>FormDrawer</Code> from <Code>src/components/ui/</Code> (see Documentation →
        Modules). For core-only screens, use <Code>src/screens/MyFeature.tsx</Code>.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Prefer <Code>useAirtableListQuery(tableKey)</Code> or generated hooks (TanStack
        Query) for loading, error, cache, and refetch — see Data fetching. Map rows with
        mappers in <Code>lib/*FromRecords.ts</Code> (camelCase field keys from{' '}
        <Code>tables.ts</Code>).
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Reuse layout pieces: <Code>PageContainer</Code>, <Code>PageHeader</Code>,{' '}
        <Code>PageContents</Code>, <Code>Loading</Code>, <Code>Create</Code>,{' '}
        <Code>Action</Code>, <Code>useToast()</Code> for feedback after saves and API
        errors.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        For linked records, store Airtable record ids in arrays; resolve display names
        with a second <Code>list()</Code> or a lookup map in the screen.
      </Typography>
    </DocSection>
  )
}
