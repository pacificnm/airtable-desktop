export function isMissingElectronHandlerError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return /no handler registered/i.test(message)
}

export function electronHandlerRestartMessage(): string {
  return 'Stop and restart npm run electron:dev so the Electron main process loads the latest IPC handlers.'
}
