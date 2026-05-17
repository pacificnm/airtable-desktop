import {
  CLIENT_REQUEST_ATTEMPT_HEADER,
  CLIENT_REQUEST_ID_HEADER,
} from '../airtable/requestId.ts'
import { captureRequest, captureResponse } from './captureHttp.ts'
import { captureDebugStack, normalizeFilePath } from './errorLocation.ts'
import { extractRateLimitInfo } from './rateLimitHeaders.ts'
import { isDebugEnabled } from '../env/isDebugEnabled.ts'
import { debugStore } from './debugStore.ts'
import type { DebugPerfEntry } from './types.ts'

function readClientRequestMeta(
  input: RequestInfo | URL,
  init?: RequestInit,
): { requestId?: string; attempt?: number } {
  const fromHeaders = (h: Headers): { requestId?: string; attempt?: number } => {
    const requestId = h.get(CLIENT_REQUEST_ID_HEADER) ?? undefined
    const attemptRaw = h.get(CLIENT_REQUEST_ATTEMPT_HEADER)
    const attempt =
      attemptRaw != null && attemptRaw !== '' ? Number(attemptRaw) : undefined
    return {
      requestId,
      attempt: attempt != null && !Number.isNaN(attempt) ? attempt : undefined,
    }
  }

  if (input instanceof Request) {
    const merged = new Headers(input.headers)
    if (init?.headers) {
      new Headers(init.headers as HeadersInit).forEach((v, k) => merged.set(k, v))
    }
    return fromHeaders(merged)
  }
  if (init?.headers) {
    return fromHeaders(new Headers(init.headers as HeadersInit))
  }
  return {}
}

const CAPTURE_HTTP_DETAILS = import.meta.env.DEV

let installed = false

export function collectPerfSnapshot(): DebugPerfEntry[] {
  const entries: DebugPerfEntry[] = []
  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined

  if (nav) {
    entries.push({
      id: 'nav-dom',
      label: 'DOM content loaded',
      value: `${Math.round(nav.domContentLoadedEventEnd)} ms`,
    })
    entries.push({
      id: 'nav-load',
      label: 'Page load',
      value: `${Math.round(nav.loadEventEnd)} ms`,
    })
    entries.push({
      id: 'nav-ttfb',
      label: 'Time to first byte',
      value: `${Math.round(nav.responseStart)} ms`,
    })
  }

  const mem = (
    performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
  ).memory
  if (mem) {
    entries.push({
      id: 'mem-used',
      label: 'JS heap used',
      value: `${(mem.usedJSHeapSize / 1048576).toFixed(1)} MB`,
      detail: `Limit ${(mem.jsHeapSizeLimit / 1048576).toFixed(0)} MB`,
    })
  }

  entries.push({
    id: 'env',
    label: 'Environment',
    value: import.meta.env.DEV ? 'development' : 'production',
  })

  if (typeof navigator !== 'undefined') {
    entries.push({
      id: 'ua',
      label: 'User agent',
      value: navigator.userAgent.slice(0, 80),
      detail: navigator.userAgent.length > 80 ? navigator.userAgent : undefined,
    })
  }

  return entries
}

function refreshPerf(): void {
  debugStore.setPerf(collectPerfSnapshot())
}

export function installDebugInstrumentation(): void {
  if (installed || typeof window === 'undefined' || !isDebugEnabled()) return
  installed = true

  refreshPerf()
  window.addEventListener('load', refreshPerf)

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const start = performance.now()
    const method = (
      init?.method ?? (input instanceof Request ? input.method : 'GET')
    ).toUpperCase()
    let url: string
    if (typeof input === 'string') url = input
    else if (input instanceof URL) url = input.href
    else url = input.url

    const requestCapture = CAPTURE_HTTP_DETAILS
      ? await captureRequest(input, init).catch(() => undefined)
      : undefined
    const clientMeta = readClientRequestMeta(input, init)

    try {
      const res = await originalFetch(input, init)
      const responseCapture = CAPTURE_HTTP_DETAILS
        ? await captureResponse(res).catch(() => undefined)
        : undefined
      const rateLimit = extractRateLimitInfo(res.headers)
      debugStore.addNetwork({
        method,
        url,
        status: res.status,
        ok: res.ok,
        durationMs: Math.round(performance.now() - start),
        request: requestCapture,
        response: responseCapture,
        requestId: clientMeta.requestId,
        attempt: clientMeta.attempt,
        rateLimit,
      })
      return res
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Network request failed'
      debugStore.addNetwork({
        method,
        url,
        status: null,
        ok: false,
        durationMs: Math.round(performance.now() - start),
        error: message,
        request: requestCapture,
        requestId: clientMeta.requestId,
        attempt: clientMeta.attempt,
      })
      debugStore.addError({
        message,
        source: 'fetch',
        detail: url,
        stack:
          err instanceof Error && err.stack
            ? err.stack
            : captureDebugStack(),
      })
      throw err
    }
  }

  window.addEventListener('error', (event) => {
    debugStore.addError({
      message: event.message || 'Uncaught error',
      source: 'window',
      location: event.filename
        ? `${normalizeFilePath(event.filename)}:${event.lineno}:${event.colno}`
        : undefined,
      stack: event.error instanceof Error ? event.error.stack : undefined,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    debugStore.addError({
      message:
        reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
            ? reason
            : 'Unhandled promise rejection',
      source: 'unhandledrejection',
      stack: reason instanceof Error ? reason.stack : undefined,
    })
  })

  const originalConsoleError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    const message = args
      .map((a) => {
        if (a instanceof Error) return a.message
        if (typeof a === 'string') return a
        try {
          return JSON.stringify(a)
        } catch {
          return String(a)
        }
      })
      .join(' ')
    const skipDebugCapture =
      message.includes('getSnapshot should be cached') ||
      message.includes('Maximum update depth exceeded') ||
      message.includes('React DevTools')
    if (message.trim() && !skipDebugCapture) {
      const errArg = args.find((a): a is Error => a instanceof Error)
      debugStore.addError({
        message,
        source: 'console.error',
        stack: errArg?.stack ?? captureDebugStack(),
      })
    }
    originalConsoleError(...args)
  }
}
