export type DebugHttpPart = {
  headers: Record<string, string>
  body?: string
  bodyTruncated?: boolean
}

export type DebugRateLimitInfo = {
  retryAfterMs?: number
  limit?: string
  remaining?: string
  reset?: string
  raw?: Record<string, string>
}

export type DebugNetworkEntry = {
  id: string
  timestamp: number
  method: string
  url: string
  status: number | null
  ok: boolean
  durationMs: number
  error?: string
  /** Client correlation id (`X-Client-Request-Id`). */
  requestId?: string
  /** Zero-based attempt index when retries ran. */
  attempt?: number
  rateLimit?: DebugRateLimitInfo
  /** Populated in development builds when instrumentation captures bodies. */
  request?: DebugHttpPart
  response?: DebugHttpPart
}

export type DebugStackFrame = {
  file: string
  line?: number
  column?: number
  name?: string
  /** node_modules, Vite client, etc. */
  internal?: boolean
}

export type DebugErrorEntry = {
  id: string
  timestamp: number
  message: string
  /** Where the error was reported from (channel or legacy location string). */
  source?: string
  /** Best-effort app source file, e.g. `src/screens/Foo.tsx:42`. */
  location?: string
  stack?: string
  frames?: readonly DebugStackFrame[]
  /** Extra context (e.g. fetch URL). */
  detail?: string
}

export type DebugPerfEntry = {
  id: string
  label: string
  value: string
  detail?: string
}

export type DebugSnapshot = {
  network: readonly DebugNetworkEntry[]
  errors: readonly DebugErrorEntry[]
  perf: readonly DebugPerfEntry[]
  failedNetworkCount: number
  errorCount: number
}
