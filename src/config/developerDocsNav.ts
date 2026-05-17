import type { DocNavGroup, DocSectionId } from '../content/developerDocs/types.ts'

export const developerDocsNav: readonly DocNavGroup[] = [
  {
    id: 'start',
    label: 'Getting started',
    items: [{ id: 'overview', label: 'Overview' }],
  },
  {
    id: 'build',
    label: 'Build your app',
    items: [
      { id: 'connect', label: 'Connect your base' },
      { id: 'oauth', label: 'OAuth setup' },
      { id: 'connection-profiles', label: 'Connection profiles' },
      { id: 'register-tables', label: 'Register tables' },
      { id: 'modules', label: 'Modules' },
      { id: 'validation-hooks', label: 'Validation & hooks' },
      { id: 'data-fetching', label: 'Data fetching' },
      { id: 'pagination', label: 'Pagination' },
      { id: 'screen-scaffold', label: 'Scaffold a screen' },
      { id: 'list-template', label: 'List screen template' },
      { id: 'screens-routes', label: 'Screens & routes' },
      { id: 'build-ui', label: 'Build the UI' },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'toast', label: 'Toast notifications' },
      { id: 'theme', label: 'Theme & tokens' },
      { id: 'errors', label: 'Error handling' },
      { id: 'debug', label: 'Debug panel' },
    ],
  },
  {
    id: 'ship',
    label: 'Ship',
    items: [{ id: 'run-ship', label: 'Run & ship' }],
  },
]

export const defaultDocSectionId: DocSectionId = 'overview'

export const docSectionLabels: Record<DocSectionId, string> =
  Object.fromEntries(
    developerDocsNav.flatMap((g) => g.items.map((i) => [i.id, i.label])),
  ) as Record<DocSectionId, string>
