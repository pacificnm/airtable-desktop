# REST client resilience

All `AirtableRestClient` HTTP calls use `fetchWithRetry` (`src/lib/airtable/fetchWithRetry.ts`).

## Retries

| Status | Behavior |
|--------|----------|
| **429** | Rate limited — retry up to 3 times |
| **503** | Service unavailable — retry up to 3 times |

Delay between attempts:

1. `Retry-After` response header (seconds or HTTP-date), if present
2. Otherwise exponential backoff (429: 1s → 2s → 4s … capped at 30s; 503: shorter cap)

Each attempt is a separate row in the debug **Network** tab (same `requestId`).

## Debug panel

Outgoing requests set:

- `X-Client-Request-Id` — e.g. `req-m3abc-xyz12` (shown on each row)
- `X-Client-Request-Attempt` — `0` on first try, `1`, `2`, … on retries

Response rows may show rate-limit info when headers are present (`Retry-After`, `X-RateLimit-*`, or `x-airtable-rate-limit-*`).

## Custom fetch

```ts
import { fetchWithRetry, createRequestId } from '../lib/airtable/fetchWithRetry.ts'

const id = createRequestId()
const res = await fetchWithRetry(url, { headers }, { requestId: id, maxRetries: 5 })
```
