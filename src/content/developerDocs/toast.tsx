import Typography from '@mui/material/Typography'
import {
  Code,
  DocPre,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ToastSection() {
  return (
    <DocSection title="Toast notifications" hideTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The app wraps the shell in <Code>ToastProvider</Code> (see{' '}
        <Code>src/App.tsx</Code>). Use <Code>useToast()</Code> from any screen or
        component to show success, error, info, or warning messages without local{' '}
        <Code>Snackbar</Code> state.
      </Typography>
      <DocPre>
        {`import { useToast } from '../hooks/useToast.ts'
import { toastError } from '../utils/toastError.ts'

const toast = useToast()

try {
  await api.create(values)
  toast.success('Record created')
} catch (err) {
  toastError(toast, err, 'Failed to create record')
}`}
      </DocPre>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        API: <Code>{'toast.show(message, { severity, duration })'}</Code>, plus{' '}
        <Code>toast.success</Code>, <Code>toast.error</Code>, <Code>toast.info</Code>,{' '}
        <Code>toast.warning</Code>. Helpers: <Code>messageFromError(err)</Code> and{' '}
        <Code>toastError(toast, err)</Code> for Airtable and generic errors.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Full reference: <Code>docs/toast.md</Code> in the repo root.
      </Typography>
    </DocSection>
  )
}
