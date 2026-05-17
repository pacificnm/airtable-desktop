/** Keep in sync with `src/lib/electron/appMenuActions.ts`. */
export type AppMenuAction =
  | 'openDebugPanel'
  | 'navigate:devTables'
  | 'navigate:devModules'
  | 'navigate:devDocs'
  | 'navigate:devTokens'
  | 'navigate:devTheme'

export function navigateMenuAction(view: string): AppMenuAction {
  return `navigate:${view}` as AppMenuAction
}
