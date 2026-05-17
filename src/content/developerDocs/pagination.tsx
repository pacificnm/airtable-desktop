import Typography from '@mui/material/Typography'
import {
  Code,
  DocPre,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function PaginationSection() {
  return (
    <DocSection title="Pagination" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Airtable returns up to 100 rows per request. When more data exists, the API
        includes an <Code>offset</Code> token. Use{' '}
        <Code>client.listAllRecords(tableId, options)</Code> to follow offsets until
        done, with optional <Code>maxTotal</Code> and <Code>maxPages</Code> caps.
      </Typography>
      <DocPre>
        {`const { records, truncated, pagesFetched } = await client.listAllRecords(
  config.tableId,
  {
    view: config.views?.default,
    filterByFormula: config.list?.filterByFormula,
    maxTotal: 10_000,
    onPage: ({ pageIndex, records }) => {
      console.log(\`Page \${pageIndex + 1}: \${records.length} rows\`)
    },
  },
)`}
      </DocPre>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Generated CRUD hooks include <Code>listAll()</Code> with normalized records.
        Or use <Code>listAllTableRecords(client, config)</Code> from{' '}
        <Code>src/lib/airtable/listAllTableRecords.ts</Code>.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Reference: <Code>docs/pagination.md</Code>. Each page is a separate{' '}
        <Code>fetch</Code> — watch them in the debug panel Network tab.
      </Typography>
    </DocSection>
  )
}
