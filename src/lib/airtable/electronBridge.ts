export interface AirtableOAuthTokenPayload {
  body: string
  authorization?: string
}

export interface AirtableOAuthTokenResult {
  ok: boolean
  status: number
  text: string
}

export interface ElectronAirtableBridge {
  exchangeOAuthToken: (
    payload: AirtableOAuthTokenPayload,
  ) => Promise<AirtableOAuthTokenResult>
}

export function getElectronAirtableBridge(): ElectronAirtableBridge | null {
  if (typeof window === 'undefined') return null
  const bridge = window.electronAirtable
  if (bridge && typeof bridge.exchangeOAuthToken === 'function') {
    return bridge
  }
  return null
}

declare global {
  interface Window {
    electronAirtable?: ElectronAirtableBridge
  }
}
