const MAX_BODY_CHARS = 20_000

export type CapturedHttpPart = {
  headers: Record<string, string>
  body?: string
  bodyTruncated?: boolean
}

function redactHeaderValue(name: string, value: string): string {
  const lower = name.toLowerCase()
  if (lower === 'authorization' || lower === 'cookie') return '***'
  return value
}

export function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {}
  headers.forEach((value, key) => {
    out[key] = redactHeaderValue(key, value)
  })
  return out
}

function mergeHeaderRecords(
  ...parts: (Record<string, string> | undefined)[]
): Record<string, string> {
  return Object.assign({}, ...parts.filter(Boolean))
}

function truncateText(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_BODY_CHARS) return { text, truncated: false }
  return {
    text: `${text.slice(0, MAX_BODY_CHARS)}\n\n… truncated (${text.length} chars total)`,
    truncated: true,
  }
}

export function formatBodyForDisplay(raw: string, contentType?: string): string {
  const type = contentType?.toLowerCase() ?? ''
  if (
    type.includes('json') ||
    raw.trimStart().startsWith('{') ||
    raw.trimStart().startsWith('[')
  ) {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2)
    } catch {
      return raw
    }
  }
  return raw
}

async function readBodyText(
  body: BodyInit | null | undefined,
): Promise<string | undefined> {
  if (body == null) return undefined
  if (typeof body === 'string') return body
  if (body instanceof URLSearchParams) return body.toString()
  if (body instanceof Blob) {
    const text = await body.text()
    return text || undefined
  }
  if (body instanceof ArrayBuffer) {
    return new TextDecoder().decode(body)
  }
  if (ArrayBuffer.isView(body)) {
    return new TextDecoder().decode(
      body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
    )
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const lines: string[] = []
    body.forEach((value, key) => {
      if (value instanceof File) {
        lines.push(`${key}: [File ${value.name}, ${value.size} bytes]`)
      } else {
        lines.push(`${key}: ${value}`)
      }
    })
    return lines.join('\n') || undefined
  }
  return '[unsupported body type]'
}

export async function captureRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<CapturedHttpPart> {
  if (input instanceof Request) {
    const headers = mergeHeaderRecords(
      headersToRecord(input.headers),
      init?.headers
        ? headersToRecord(new Headers(init.headers as HeadersInit))
        : undefined,
    )
    let body: string | undefined
    try {
      const clone = input.clone()
      const raw = await clone.text()
      if (raw) {
        const formatted = formatBodyForDisplay(
          raw,
          headers['content-type'] ?? headers['Content-Type'],
        )
        const { text, truncated } = truncateText(formatted)
        body = text
        return { headers, body, bodyTruncated: truncated }
      }
    } catch {
      body = init?.body != null ? await readBodyText(init.body) : undefined
    }
    if (body) {
      const { text, truncated } = truncateText(body)
      return { headers, body: text, bodyTruncated: truncated }
    }
    return { headers }
  }

  const headers = init?.headers
    ? headersToRecord(new Headers(init.headers as HeadersInit))
    : {}
  const rawBody = await readBodyText(init?.body)
  if (!rawBody) return { headers }

  const formatted = formatBodyForDisplay(
    rawBody,
    headers['content-type'] ?? headers['Content-Type'],
  )
  const { text, truncated } = truncateText(formatted)
  return { headers, body: text, bodyTruncated: truncated }
}

export async function captureResponse(res: Response): Promise<CapturedHttpPart> {
  const headers = headersToRecord(res.headers)
  try {
    const clone = res.clone()
    const raw = await clone.text()
    if (!raw) return { headers }
    const formatted = formatBodyForDisplay(
      raw,
      headers['content-type'] ?? headers['Content-Type'],
    )
    const { text, truncated } = truncateText(formatted)
    return { headers, body: text, bodyTruncated: truncated }
  } catch {
    return { headers, body: '[could not read response body]' }
  }
}
