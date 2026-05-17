import Typography from '@mui/material/Typography'
import {
  Code,
  DocPre,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function DataFetchingSection() {
  return (
    <DocSection title="Data fetching" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The app uses <strong>TanStack Query</strong> for cached Airtable reads,
        deduped in-flight requests, and automatic refetch (window focus, manual{' '}
        <Code>refetch()</Code>). The debug panel Network tab shows each fetch.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        After you paste a CRUD hook from Developer → Tables, copy the{' '}
        <strong>Query hooks</strong> snippet into the same file. That adds{' '}
        <Code>useYourTableListQuery()</Code>, <Code>useYourTableRecordQuery(id)</Code>,
        and create/update/remove mutations that invalidate the table cache.
      </Typography>
      <DocPre>
        {`import { useMyTableListQuery, useMyTableCreateMutation } from '../hooks/useMyTable.ts'
import { toastError } from '../utils/toastError.ts'
import { useToast } from '../hooks/useToast.ts'

const toast = useToast()
const { data, isLoading, isError, error, refetch } = useMyTableListQuery()
const create = useMyTableCreateMutation()

if (isLoading) return <Loading />
if (isError) return <Typography color="error">{error.message}</Typography>

const rows = data?.records ?? []

try {
  await create.mutateAsync({ title: 'New row' })
  toast.success('Created')
} catch (err) {
  toastError(toast, err)
}`}
      </DocPre>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Without a generated hook, use <Code>useAirtableListQuery('tableKey')</Code>{' '}
        and <Code>useAirtableRecordQuery('tableKey', recordId)</Code> — they read{' '}
        <Code>tables.ts</Code> directly. Cache keys live in{' '}
        <Code>src/lib/query/airtableQueryKeys.ts</Code>.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Full reference: <Code>docs/airtable-query.md</Code> in the repo root.
      </Typography>
    </DocSection>
  )
}
