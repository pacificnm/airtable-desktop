import { useEffect } from 'react'
import { useAirtable } from '../../hooks/useAirtable.ts'
import { useToast } from '../../hooks/useToast.ts'

/** Exchanges `?code=&state=` after Airtable redirect; surfaces errors in the UI. */
export function OAuthRedirectHandler() {
  const { completeOAuthFromCurrentUrl } = useAirtable()
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const params = new URLSearchParams(window.location.search)
      if (!params.get('code')) return

      try {
        const result = await completeOAuthFromCurrentUrl()
        if (cancelled) return
        if (result === 'no_params') return
        if (result === 'already_done') return

        toast.success('Signed in with OAuth')
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'OAuth callback failed'
        console.error('Airtable OAuth callback failed', err)
        toast.error(message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [completeOAuthFromCurrentUrl, toast])

  return null
}
