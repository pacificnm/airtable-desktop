import type { DocSectionDefinition, DocSectionId } from './types.ts'
import { OverviewSection } from './overview.tsx'
import { ConnectSection } from './connect.tsx'
import { OAuthSetupSection } from './oauth.tsx'
import { ConnectionProfilesSection } from './connectionProfiles.tsx'
import { RegisterTablesSection } from './registerTables.tsx'
import { ModulesSection } from './modules.tsx'
import { ValidationHooksSection } from './validationHooks.tsx'
import { DataFetchingSection } from './dataFetching.tsx'
import { PaginationSection } from './pagination.tsx'
import { ScreenScaffoldSection } from './screenScaffold.tsx'
import { ListTemplateSection } from './listTemplate.tsx'
import { ScreensRoutesSection } from './screensRoutes.tsx'
import { BuildUiSection } from './buildUi.tsx'
import { ToastSection } from './toast.tsx'
import { ThemeSection } from './theme.tsx'
import { ErrorsSection } from './errors.tsx'
import { DebugSection } from './debug.tsx'
import { RunShipSection } from './runShip.tsx'
import { docSectionLabels } from '../../config/developerDocsNav.ts'

export type { DocSectionId, DocNavGroup, DocNavItem } from './types.ts'

const sections: DocSectionDefinition[] = [
  { id: 'overview', title: docSectionLabels.overview, render: OverviewSection },
  { id: 'connect', title: docSectionLabels.connect, render: ConnectSection },
  { id: 'oauth', title: docSectionLabels.oauth, render: OAuthSetupSection },
  {
    id: 'connection-profiles',
    title: docSectionLabels['connection-profiles'],
    render: ConnectionProfilesSection,
  },
  {
    id: 'register-tables',
    title: docSectionLabels['register-tables'],
    render: RegisterTablesSection,
  },
  {
    id: 'modules',
    title: docSectionLabels.modules,
    render: ModulesSection,
  },
  {
    id: 'validation-hooks',
    title: docSectionLabels['validation-hooks'],
    render: ValidationHooksSection,
  },
  {
    id: 'data-fetching',
    title: docSectionLabels['data-fetching'],
    render: DataFetchingSection,
  },
  {
    id: 'pagination',
    title: docSectionLabels.pagination,
    render: PaginationSection,
  },
  {
    id: 'screen-scaffold',
    title: docSectionLabels['screen-scaffold'],
    render: ScreenScaffoldSection,
  },
  {
    id: 'list-template',
    title: docSectionLabels['list-template'],
    render: ListTemplateSection,
  },
  {
    id: 'screens-routes',
    title: docSectionLabels['screens-routes'],
    render: ScreensRoutesSection,
  },
  { id: 'build-ui', title: docSectionLabels['build-ui'], render: BuildUiSection },
  { id: 'toast', title: docSectionLabels.toast, render: ToastSection },
  { id: 'theme', title: docSectionLabels.theme, render: ThemeSection },
  { id: 'errors', title: docSectionLabels.errors, render: ErrorsSection },
  { id: 'debug', title: docSectionLabels.debug, render: DebugSection },
  { id: 'run-ship', title: docSectionLabels['run-ship'], render: RunShipSection },
]

export const developerDocSections: Record<DocSectionId, DocSectionDefinition> =
  Object.fromEntries(sections.map((s) => [s.id, s])) as Record<
    DocSectionId,
    DocSectionDefinition
  >

export function isDocSectionId(value: string): value is DocSectionId {
  return value in developerDocSections
}
