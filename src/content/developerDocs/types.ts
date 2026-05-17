import type { ReactNode } from 'react'

export type DocSectionId =
  | 'overview'
  | 'connect'
  | 'oauth'
  | 'connection-profiles'
  | 'register-tables'
  | 'modules'
  | 'validation-hooks'
  | 'data-fetching'
  | 'pagination'
  | 'screen-scaffold'
  | 'list-template'
  | 'screens-routes'
  | 'build-ui'
  | 'toast'
  | 'theme'
  | 'errors'
  | 'debug'
  | 'run-ship'

export interface DocNavItem {
  id: DocSectionId
  label: string
}

export interface DocNavGroup {
  id: string
  label: string
  items: readonly DocNavItem[]
}

export interface DocSectionDefinition {
  id: DocSectionId
  title: string
  render: () => ReactNode
}
