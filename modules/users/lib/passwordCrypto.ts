const PBKDF2_ITERATIONS = 150_000
const SALT_BYTES = 16
const KEY_BYTES = 32

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriveKeyBytes(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BYTES * 8,
  )
  return new Uint8Array(bits)
}

/** Stored format: `pbkdf2:<iterations>:<base64salt>:<base64hash>` */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await deriveKeyBytes(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bytesToBase64(salt)}:${bytesToBase64(hash)}`
}

export function isPasswordHashStored(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('pbkdf2:')
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  if (!isPasswordHashStored(stored)) return false
  const parts = stored.split(':')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number(parts[1])
  if (!Number.isFinite(iterations) || iterations < 1) return false
  try {
    const salt = base64ToBytes(parts[2]!)
    const expected = base64ToBytes(parts[3]!)
    const actual = await deriveKeyBytes(password, salt, iterations)
    if (actual.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < actual.length; i++) {
      diff |= actual[i]! ^ expected[i]!
    }
    return diff === 0
  } catch {
    return false
  }
}
