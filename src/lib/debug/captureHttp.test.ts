import { describe, expect, it } from 'vitest'
import {
  captureRequest,
  captureResponse,
  formatBodyForDisplay,
  headersToRecord,
} from './captureHttp.ts'

describe('headersToRecord', () => {
  it('redacts Authorization and Cookie', () => {
    const headers = new Headers({
      Authorization: 'Bearer secret-token',
      Cookie: 'session=abc',
      'Content-Type': 'application/json',
    })
    expect(headersToRecord(headers)).toEqual({
      authorization: '***',
      cookie: '***',
      'content-type': 'application/json',
    })
  })
})

describe('formatBodyForDisplay', () => {
  it('pretty-prints JSON bodies', () => {
    const raw = '{"a":1,"b":[2]}'
    expect(formatBodyForDisplay(raw, 'application/json')).toBe(
      JSON.stringify(JSON.parse(raw), null, 2),
    )
  })

  it('returns raw text when JSON parse fails', () => {
    expect(formatBodyForDisplay('{not json}')).toBe('{not json}')
  })
})

describe('captureRequest', () => {
  it('captures URL + init with redacted headers and formatted body', async () => {
    const captured = await captureRequest('https://api.airtable.com/v0/meta/bases', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer pat',
        'Content-Type': 'application/json',
      },
      body: '{"records":[]}',
    })

    expect(captured.headers.authorization).toBe('***')
    expect(captured.body).toContain('"records"')
    expect(captured.bodyTruncated).toBe(false)
  })

  it('truncates very large bodies', async () => {
    const huge = 'x'.repeat(25_000)
    const captured = await captureRequest('https://example.com', {
      body: huge,
    })
    expect(captured.bodyTruncated).toBe(true)
    expect(captured.body).toContain('truncated')
    expect(captured.body!.length).toBeLessThan(huge.length)
  })

  it('reads body from a Request clone', async () => {
    const req = new Request('https://example.com', {
      method: 'PUT',
      headers: { Authorization: 'Bearer x' },
      body: '{"ok":true}',
    })
    const captured = await captureRequest(req)
    expect(captured.headers.authorization).toBe('***')
    expect(captured.body).toContain('"ok"')
  })
})

describe('captureResponse', () => {
  it('captures status headers and JSON body', async () => {
    const res = new Response(JSON.stringify({ id: 'rec1' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    const captured = await captureResponse(res)
    expect(captured.headers['content-type']).toBe('application/json')
    expect(captured.body).toContain('"id"')
    expect(await res.json()).toEqual({ id: 'rec1' })
  })
})
