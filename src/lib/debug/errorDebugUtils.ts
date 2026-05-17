import { formatFrameLocation } from './errorLocation.ts'
import type { DebugErrorEntry } from './types.ts'

/** Plain-text bundle for clipboard (message, metadata, frames, stack). */
export function formatErrorEntryForCopy(entry: DebugErrorEntry): string {
  const lines: string[] = [`Message: ${entry.message}`]

  if (entry.source) lines.push(`Source: ${entry.source}`)
  lines.push(`Time: ${new Date(entry.timestamp).toISOString()}`)
  if (entry.location) lines.push(`Location: ${entry.location}`)
  if (entry.detail) lines.push(`Detail: ${entry.detail}`)

  const frames = entry.frames ?? []
  if (frames.length > 0) {
    lines.push('', 'Frames:')
    for (const frame of frames) {
      const loc = formatFrameLocation(frame)
      lines.push(
        frame.name ? `  at ${frame.name} (${loc})` : `  at ${loc}`,
      )
    }
  }

  if (entry.stack?.trim()) {
    lines.push('', 'Stack trace:', entry.stack.trim())
  }

  return lines.join('\n')
}
