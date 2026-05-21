/** Core shell routes — module routes are dynamic strings registered at runtime. */
export const CORE_APP_VIEWS = [
  'home',
  'devTables',
  'devDocs',
  'devTokens',
  'devTheme',
  'devModules',
  'devBaseTables',
  'devDataFileMappings',
] as const

export type CoreAppView = (typeof CORE_APP_VIEWS)[number]

/** App route id: core views plus any enabled module screen id. */
export type AppView = CoreAppView | (string & {})

export function isCoreAppView(value: string): value is CoreAppView {
  return (CORE_APP_VIEWS as readonly string[]).includes(value)
}
