import type { OAuthTokenResponse } from './types.ts'
import { AirtableApiError } from './errors.ts'
import { getElectronAirtableBridge } from './electronBridge.ts'

export const AIRTABLE_AUTHORIZE_URL =
  'https://airtable.com/oauth2/v1/authorize' as const

const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._'

export function randomOAuthString(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += PKCE_CHARSET[bytes[i]! % PKCE_CHARSET.length]!
  }
  return out
}

export async function createPkcePairS256(): Promise<{
  verifier: string
  challenge: string
}> {
  const verifier = randomOAuthString(64)
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const challenge = base64Url(new Uint8Array(digest))
  return { verifier, challenge }
}

function base64Url(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function buildAuthorizationUrl(params: {
  clientId: string
  redirectUri: string
  scope: string
  state: string
  codeChallenge: string
}): string {
  const u = new URL(AIRTABLE_AUTHORIZE_URL)
  u.searchParams.set('client_id', params.clientId)
  u.searchParams.set('redirect_uri', params.redirectUri)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('scope', params.scope)
  u.searchParams.set('state', params.state)
  u.searchParams.set('code_challenge', params.codeChallenge)
  u.searchParams.set('code_challenge_method', 'S256')
  return u.toString()
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  const raw = `${clientId}:${clientSecret}`
  const b64 = btoa(raw)
  return `Basic ${b64}`
}

function safeJsonParse(text: string): unknown | null {
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function parseOAuthTokenResponse(
  status: number,
  text: string,
): OAuthTokenResponse {
  const json = safeJsonParse(text)
  const ok = status >= 200 && status < 300
  if (!ok) {
    const desc =
      typeof json === 'object' &&
      json !== null &&
      'error_description' in json &&
      typeof (json as { error_description?: string }).error_description ===
        'string'
        ? (json as { error_description: string }).error_description
        : `OAuth token error (${status})`
    throw new AirtableApiError(desc, { status, body: json })
  }
  return json as OAuthTokenResponse
}

async function postOAuthTokenRequest(options: {
  tokenUrl: string
  body: URLSearchParams
  authorization?: string
}): Promise<OAuthTokenResponse> {
  const bodyStr = options.body.toString()
  const bridge = getElectronAirtableBridge()
  if (bridge) {
    const result = await bridge.exchangeOAuthToken({
      body: bodyStr,
      authorization: options.authorization,
    })
    return parseOAuthTokenResponse(result.status, result.text)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  if (options.authorization) {
    headers.Authorization = options.authorization
  }

  const res = await fetch(options.tokenUrl, {
    method: 'POST',
    headers,
    body: bodyStr,
  })
  const text = await res.text()
  return parseOAuthTokenResponse(res.status, text)
}

export async function exchangeAuthorizationCode(params: {
  tokenUrl: string
  code: string
  redirectUri: string
  clientId: string
  clientSecret?: string
  codeVerifier: string
}): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  })
  if (!params.clientSecret) {
    body.set('client_id', params.clientId)
  }

  const authorization = params.clientSecret
    ? basicAuthHeader(params.clientId, params.clientSecret)
    : undefined

  return postOAuthTokenRequest({
    tokenUrl: params.tokenUrl,
    body,
    authorization,
  })
}

export async function refreshAccessToken(params: {
  tokenUrl: string
  refreshToken: string
  clientId: string
  clientSecret?: string
}): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
  })
  if (!params.clientSecret) {
    body.set('client_id', params.clientId)
  }

  const authorization = params.clientSecret
    ? basicAuthHeader(params.clientId, params.clientSecret)
    : undefined

  return postOAuthTokenRequest({
    tokenUrl: params.tokenUrl,
    body,
    authorization,
  })
}
