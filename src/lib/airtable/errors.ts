export class AirtableApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(
    message: string,
    options: { status: number; body?: unknown; cause?: unknown },
  ) {
    super(message, { cause: options.cause })
    this.name = 'AirtableApiError'
    this.status = options.status
    this.body = options.body
  }
}
