# Toast notifications

Global snackbar feedback for success, error, info, and warning messages. Use this instead of adding a `Snackbar` to every screen.

## Setup

`ToastProvider` is already mounted in `src/App.tsx` inside `ThemeProvider`, so any component under the app shell can call `useToast()`.

## Basic usage

```tsx
import { useToast } from '../hooks/useToast.ts'

function MyScreen() {
  const toast = useToast()

  const handleSave = async () => {
    try {
      await doSomething()
      toast.success('Saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    }
  }
}
```

## API

| Method | Description |
|--------|-------------|
| `toast.show(message, options?)` | Generic toast; `options.severity` defaults to `success` |
| `toast.success(message, options?)` | Green success alert |
| `toast.error(message, options?)` | Red error alert |
| `toast.info(message, options?)` | Blue info alert |
| `toast.warning(message, options?)` | Amber warning alert |

`options.duration` sets auto-hide time in milliseconds (default **4000**).

## Errors from API calls

Use helpers in `src/utils/toastError.ts` for consistent messages from `AirtableApiError`, `Error`, or strings:

```tsx
import { useToast } from '../hooks/useToast.ts'
import { toastError, messageFromError } from '../utils/toastError.ts'

const toast = useToast()

try {
  await ticketsApi.create(values)
  toast.success('Ticket created')
} catch (err) {
  toastError(toast, err, 'Failed to create ticket')
}

// Or only extract the message:
const msg = messageFromError(err, 'Request failed')
```

## After mutations

Typical pattern with generated CRUD hooks:

1. Call `create` / `update` / `remove` inside `try/catch`.
2. `toast.success(...)` on success.
3. `toastError(toast, err, ...)` on failure.
4. Refetch list data or update local state.

## Placement

Toasts appear **bottom-center** (above the main content, clear of the debug FAB in the bottom-right). Only one toast is shown at a time; a new call replaces the previous message.

## Files

| File | Role |
|------|------|
| `src/context/ToastContext.tsx` | Provider + `useToast` |
| `src/hooks/useToast.ts` | Re-export for imports |
| `src/utils/toastError.ts` | `messageFromError`, `toastError` |
