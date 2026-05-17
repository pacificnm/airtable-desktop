import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  severity?: ToastSeverity
  /** Auto-hide delay in ms. Default 4000. */
  duration?: number
}

export interface ToastApi {
  show: (message: string, options?: ToastOptions) => void
  success: (message: string, options?: Omit<ToastOptions, 'severity'>) => void
  error: (message: string, options?: Omit<ToastOptions, 'severity'>) => void
  info: (message: string, options?: Omit<ToastOptions, 'severity'>) => void
  warning: (message: string, options?: Omit<ToastOptions, 'severity'>) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const defaultDuration = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean
    message: string
    severity: ToastSeverity
    duration: number
  }>({
    open: false,
    message: '',
    severity: 'success',
    duration: defaultDuration,
  })

  const show = useCallback((message: string, options?: ToastOptions) => {
    const trimmed = message.trim()
    if (!trimmed) return
    setState({
      open: true,
      message: trimmed,
      severity: options?.severity ?? 'success',
      duration: options?.duration ?? defaultDuration,
    })
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, options) =>
        show(message, { ...options, severity: 'success' }),
      error: (message, options) =>
        show(message, { ...options, severity: 'error' }),
      info: (message, options) => show(message, { ...options, severity: 'info' }),
      warning: (message, options) =>
        show(message, { ...options, severity: 'warning' }),
    }),
    [show],
  )

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={state.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 1 }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%', maxWidth: 480 }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>')
  }
  return ctx
}
