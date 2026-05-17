import { AirtableApiError } from '../lib/airtable/errors.ts'
import type { ToastApi } from '../context/ToastContext.tsx'

/** User-facing message from an unknown thrown value (API errors, Error, strings). */
export function messageFromError(
  err: unknown,
  fallback = 'Something went wrong',
): string {
  if (err instanceof AirtableApiError) {
    return err.message || fallback
  }
  if (err instanceof Error) {
    return err.message || fallback
  }
  if (typeof err === 'string' && err.trim()) {
    return err.trim()
  }
  return fallback
}

/** Show a toast with the best available error message. */
export function toastError(
  toast: ToastApi,
  err: unknown,
  fallback = 'Something went wrong',
): void {
  toast.error(messageFromError(err, fallback))
}
