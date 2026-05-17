import type { DebugErrorEntry, DebugStackFrame } from './types.ts'

/** Firefox: `fn@url:line:col` */
const FIREFOX_FRAME = /^(.*)@(.+?):(\d+):(\d+)$/

const INTERNAL_PATH =
  /node_modules|@vite\/client|@react-refresh|vite\/dist|webpack:|chrome-extension:|<anonymous>|^internal\//

export function normalizeFilePath(urlOrPath: string): string {
  const trimmed = urlOrPath.trim()
  if (!trimmed) return trimmed

  try {
    if (trimmed.includes('://') || trimmed.startsWith('file://')) {
      const pathname = trimmed.startsWith('file://')
        ? decodeURIComponent(trimmed.replace(/^file:\/\//, ''))
        : new URL(trimmed).pathname
      if (pathname.startsWith('/@fs')) {
        const abs = decodeURIComponent(pathname.replace(/^\/@fs/, ''))
        const srcIdx = abs.indexOf('/src/')
        if (srcIdx >= 0) return abs.slice(srcIdx + 1)
        const docsIdx = abs.indexOf('/docs/')
        if (docsIdx >= 0) return abs.slice(docsIdx + 1)
        return abs
      }
      if (pathname.startsWith('/src/')) return pathname.slice(1)
      if (pathname.startsWith('/docs/')) return pathname.slice(1)
      return pathname
    }
  } catch {
    /* use raw string */
  }

  const srcIdx = trimmed.indexOf('/src/')
  if (srcIdx >= 0) return trimmed.slice(srcIdx + 1)
  const docsIdx = trimmed.indexOf('/docs/')
  if (docsIdx >= 0) return trimmed.slice(docsIdx + 1)

  return trimmed.replace(/^\/+/, '')
}

function isInternalPath(file: string): boolean {
  return INTERNAL_PATH.test(file)
}

function frameFromParts(
  rawFile: string,
  line: number,
  column: number,
  name?: string,
): DebugStackFrame | null {
  const file = normalizeFilePath(rawFile)
  if (!file) return null
  return {
    file,
    line,
    column,
    name: name?.trim() || undefined,
    internal: isInternalPath(file) || isInternalPath(rawFile),
  }
}

function parseChromeStackLine(line: string): DebugStackFrame | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('at ')) return null
  const rest = trimmed.slice(3)
  const lineCol = rest.match(/:(\d+):(\d+)$/)
  if (!lineCol) return null
  const column = Number(lineCol[2])
  const lineNo = Number(lineCol[1])
  const before = rest.slice(0, rest.length - lineCol[0].length)
  const paren = before.match(/^(.+?)\s+\((.+)\)$/)
  if (paren) {
    return frameFromParts(paren[2], lineNo, column, paren[1])
  }
  return frameFromParts(before, lineNo, column)
}

export function parseStack(stack: string): DebugStackFrame[] {
  const frames: DebugStackFrame[] = []
  for (const line of stack.split('\n')) {
    const chrome = parseChromeStackLine(line)
    if (chrome) {
      frames.push(chrome)
      continue
    }
    const firefox = FIREFOX_FRAME.exec(line.trim())
    if (firefox) {
      const [, name, file, lineNo, colNo] = firefox
      const frame = frameFromParts(file, Number(lineNo), Number(colNo), name)
      if (frame) frames.push(frame)
    }
  }
  return frames
}

export function formatFrameLocation(frame: DebugStackFrame): string {
  const loc = frame.line != null ? `${frame.file}:${frame.line}` : frame.file
  return frame.column != null ? `${loc}:${frame.column}` : loc
}

export function pickPrimaryLocation(
  frames: readonly DebugStackFrame[],
  source?: string,
): string | undefined {
  const appFrame = frames.find((f) => !f.internal)
  if (appFrame) return formatFrameLocation(appFrame)

  const anyFrame = frames[0]
  if (anyFrame) return formatFrameLocation(anyFrame)

  if (source && /:\d+/.test(source) && !/^(console\.|fetch|window|unhandled|ErrorBoundary)/.test(source)) {
    return normalizeFilePath(source)
  }

  return undefined
}

export function enrichDebugError(
  partial: Omit<DebugErrorEntry, 'id' | 'timestamp'>,
): Omit<DebugErrorEntry, 'id' | 'timestamp'> {
  const frames =
    partial.frames ?? (partial.stack ? parseStack(partial.stack) : undefined)
  const location =
    partial.location ?? (frames?.length ? pickPrimaryLocation(frames, partial.source) : undefined)

  return {
    ...partial,
    ...(frames?.length ? { frames } : {}),
    ...(location ? { location } : {}),
  }
}

/** Stack for errors logged without an `Error` instance (skips instrumentation frames). */
export function captureDebugStack(): string | undefined {
  const stack = new Error().stack
  if (!stack) return undefined
  const lines = stack.split('\n')
  const dropUntil = lines.findIndex((l) => l.includes('installDebugInstrumentation'))
  const start = dropUntil >= 0 ? dropUntil + 1 : 3
  return ['Error', ...lines.slice(start)].join('\n')
}
