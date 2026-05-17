import type { UsersAuthProvider } from './usersAuthConfig.ts'

export interface UsersModuleSession {
  userRecordId: string
  email: string
  displayName: string
  username?: string
  roleIds: string[]
  authProvider: UsersAuthProvider
  signedInAtMs: number
}

const STORAGE_KEY = 'users-module:session:v1'

export function readUsersModuleSession(): UsersModuleSession | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UsersModuleSession
    if (!parsed?.userRecordId || !parsed.email) return null
    return parsed
  } catch {
    return null
  }
}

export function writeUsersModuleSession(session: UsersModuleSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearUsersModuleSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}
