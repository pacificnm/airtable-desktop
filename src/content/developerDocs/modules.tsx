import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import {
  Code,
  DocParagraph,
  DocPre,
  DocSection,
} from '../../components/developer/docs/docPrimitives.tsx'

export function ModulesSection() {
  return (
    <DocSection title="Modules" hideTitle>
      <DocParagraph>
        Features ship as <strong>modules</strong> under <Code>modules/&lt;id&gt;/</Code>,
        separate from the core shell in <Code>src/</Code>. Core discovers every{' '}
        <Code>modules/*/index.ts</Code> at build time and registers tables, routes, and
        navigation only for ids listed in <Code>src/config/enabledModules.ts</Code>. You
        do not edit <Code>screens.ts</Code>, <Code>menu.ts</Code>, or{' '}
        <Code>tables.ts</Code> in <Code>src/</Code> for module features.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        When to use a module
      </Typography>
      <DocParagraph>
        Use a module for product features (settings, roles, notifications, your domain).
        Use <Code>src/screens/</Code> only for one-off app shell pages or experiments
        that are not meant to be installed or disabled as a unit. Modules can declare{' '}
        <Code>dependsOn</Code>, provision their own Airtable tables, and ship README +
        setup docs for operators.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Folder layout
      </Typography>
      <DocPre>{`modules/my-feature/
  index.ts              # manifest (default export)
  README.md             # shown in Developer → Modules
  airtable-setup.md     # operator setup steps
  tables.ts             # table keys, field map, columns
  blueprints.ts         # schema for Developer → Enable (Meta API)
  validation/           # table keys, zod/forms
  hooks/                # useAirtableListQuery, CRUD mutations
  lib/                  # record mappers, *ListColumns.tsx, *CardLayout.tsx
  components/           # *Form.tsx, header slots, bridges
  screens/              # default-export screen components`}</DocPre>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Enable or disable
      </Typography>
      <DocParagraph>
        <strong>Developer → Modules → Enable</strong> (while connected to your base).
        The app provisions dependency modules first, creates tables via blueprints, seeds
        config rows, saves table ids to App Config and (in Electron dev){' '}
        <Code>modules/*/tables.ts</Code>, then reloads and updates{' '}
        <Code>enabledModules.ts</Code>. To disable: <strong>Uninstall</strong> on that
        module (clears provisioning state; does not delete Airtable tables).
      </DocParagraph>
      <DocParagraph>
        Manual alternative: add <Code>'my-feature'</Code> to{' '}
        <Code>enabledModuleIds</Code> in <Code>src/config/enabledModules.ts</Code> and
        restart <Code>npm run electron:dev</Code>.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Step-by-step: create a module
      </Typography>
      <List dense disablePadding sx={{ listStyle: 'decimal', pl: 2.5, mb: 2 }}>
        <ListItem sx={{ display: 'list-item', py: 0.5 }}>
          <ListItemText primary="Copy `modules/config/` or `modules/roles/` as a template; rename the folder to your id (lowercase, e.g. `inventory`)." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.5 }}>
          <ListItemText
            primary={
              <>
                Edit <Code>index.ts</Code>: set <Code>id</Code>, <Code>name</Code>,{' '}
                <Code>version</Code>, <Code>dependsOn</Code> (usually{' '}
                <Code>['config']</Code>), <Code>screens</Code>, <Code>menuItems</Code>
                or <Code>menuSections</Code>, <Code>tables</Code>,{' '}
                <Code>tableBlueprints</Code>.
              </>
            }
          />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.5 }}>
          <ListItemText primary="Define `tables.ts` with stable `key`s and `fields` (camelCase → Airtable column names). Use Developer → Tables to copy snippets or paste real `tbl…` ids." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.5 }}>
          <ListItemText primary="Add `blueprints.ts` so Enable can create tables in your base (requires `schema.bases:write`)." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.5 }}>
          <ListItemText primary="Implement hooks (`useAirtableListQuery`, `useAirtableMutation`), `*FromRecords.ts` mappers, and list screens using the shared UI kit (below)." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.5 }}>
          <ListItemText primary="Document operators in `airtable-setup.md`; add `module.<id>.enabled` to config blueprints if you use runtime toggles." />
        </ListItem>
        <ListItem sx={{ display: 'list-item', py: 0.5 }}>
          <ListItemText primary="Add your id to `enabledModuleIds`, restart, then Developer → Modules → Enable to provision." />
        </ListItem>
      </List>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Manifest (<Code>index.ts</Code>)
      </Typography>
      <DocPre>{`import type { AppModuleDefinition } from '../../src/lib/modules/types.ts'
import { myTableBlueprints } from './blueprints.ts'
import { myModuleTables } from './tables.ts'

const myModule = {
  id: 'inventory',
  name: 'Inventory',
  version: '0.1.0',
  dependsOn: ['config'] as const,
  description: 'Stock items and locations.',
  readmePath: 'README.md',
  airtableSetupPath: 'airtable-setup.md',
  tables: myModuleTables,
  tableBlueprints: myTableBlueprints,
  screens: [
    {
      id: 'inventoryList',
      title: 'Inventory',
      importScreen: () => import('./screens/InventoryListScreen.tsx'),
    },
  ],
  menuItems: [
    {
      id: 'inventory-list',
      label: 'Inventory',
      icon: 'gridView',
      viewId: 'inventoryList',
      placements: [
        { surface: 'appDrawer', section: { id: 'inventory', label: 'Inventory' } },
      ],
    },
  ],
} satisfies AppModuleDefinition

export default myModule`}</DocPre>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Menu nav groups
      </Typography>
      <DocParagraph>
        Declare drawer sections in <Code>menuNav.groups</Code>, then attach items with{' '}
        <Code>menuGroupId</Code>. Use <Code>scope: 'global'</Code> so multiple modules merge
        into one hamburger section (e.g. all reference tables under “Reference data”). Omit
        scope (or <Code>module</Code>) to keep a section private to that module. Legacy{' '}
        <Code>menuSections</Code> still works.
      </DocParagraph>
      <DocPre>{`menuNav: {
  groups: [
    { id: 'location', label: 'Location', scope: 'global', order: 20 },
    { id: 'reference', label: 'Reference data', scope: 'global', order: 200 },
  ],
},
menuItems: [
  {
    id: 'city-list',
    label: 'City',
    icon: 'gridView',
    viewId: 'cityList',
    menuGroupId: 'location',
  },
  {
    id: 'inventory-list',
    label: 'Inventory',
    icon: 'gridView',
    viewId: 'inventoryList',
    placements: [
      { surface: 'appDrawer', section: { id: 'inventory', label: 'Inventory' } },
      { surface: 'electron', menu: 'developer', order: 40 },
    ],
  },
]`}</DocPre>
      <List dense disablePadding sx={{ mb: 2 }}>
        <ListItem>
          <ListItemText
            primary={<Code>menuGroupId</Code>}
            secondary="Drawer only — resolved from this module's menuNav.groups."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              <Code>{`placements: [{ surface: 'appDrawer', section: { id, label, scope?, order? } }]`}</Code>
            }
            secondary="Explicit drawer section (per-item). Use scope global to merge across modules."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              <Code>{`{ surface: 'electron', menu: 'view' | 'developer', order? }`}</Code>
            }
            secondary="Native menu bar. Combine with menuGroupId for drawer + Electron."
          />
        </ListItem>
      </List>
      <DocParagraph>
        Built-in developer tools (Tables, Modules, Documentation, CSS tokens, MUI theme)
        register in <strong>Electron menus only</strong> via{' '}
        <Code>src/lib/menu/coreMenuContributions.ts</Code> — not in the drawer.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Header slots
      </Typography>
      <DocParagraph>
        Modules can add toolbar controls before the user avatar (e.g. notifications
        bell):
      </DocParagraph>
      <DocPre>{`headerSlots: [
  {
    id: 'bell',
    order: 10,
    importSlot: () => import('./components/MyHeaderSlot.tsx'),
  },
]`}</DocPre>
      <DocParagraph>
        In the slot component, use <Code>useHeaderSlotContext()</Code> for{' '}
        <Code>onNavigate(view)</Code>. See <Code>modules/notifications/</Code>.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        List screens (required UI kit)
      </Typography>
      <DocParagraph>
        Do <strong>not</strong> add custom tables, drawers, or dialogs under{' '}
        <Code>modules/</Code>. Use <Code>src/components/ui/</Code>:
      </DocParagraph>
      <List dense disablePadding sx={{ mb: 2 }}>
        <ListItem>
          <ListItemText primary="RecordListPage" secondary="Page shell, loading/error, optional grid/card toggle." />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="RecordCollectionView"
            secondary="DataTable columns + RecordCard layout; pass viewMode from useRecordViewMode('yourScreenId')."
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="FormDrawer + FormStack / FormTextField / FormSelect" secondary="Create and edit." />
        </ListItem>
        <ListItem>
          <ListItemText primary="ConfirmDeleteDialog, AddButton, useToast()" secondary="Deletes and feedback." />
        </ListItem>
      </List>
      <DocParagraph>
        Reference implementation: <Code>modules/roles/screens/RolesListScreen.tsx</Code>{' '}
        with <Code>rolesListColumns.tsx</Code> and <Code>rolesCardLayout.tsx</Code>.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Data layer
      </Typography>
      <DocParagraph>
        Import from <Code>src/</Code>: <Code>useAirtableListQuery(tableKey)</Code>,{' '}
        <Code>useAirtableMutation</Code>, <Code>normalizeRecord</Code> / field mappers in{' '}
        <Code>lib/*FromRecords.ts</Code>. Table keys must match <Code>tables.ts</Code>. See
        Documentation → Data fetching and Validation & hooks.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Runtime feature flags (config module)
      </Typography>
      <DocParagraph>
        When the <Code>config</Code> module is enabled, add App Config rows like{' '}
        <Code>module.inventory.enabled</Code> (boolean). In UI:
      </DocParagraph>
      <DocPre>{`import { useModuleEnabled } from '../../modules/config/hooks/useModuleEnabled.ts'

const { enabled, isLoading } = useModuleEnabled('inventory')`}</DocPre>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Notifications (optional)
      </Typography>
      <DocParagraph>
        Any module can publish without depending on the notifications module:
      </DocParagraph>
      <DocPre>{`import { publishNotification } from '../../src/lib/notifications/index.ts'

publishNotification({
  title: 'Stock low',
  body: 'SKU-42 below threshold',
  sourceModule: 'inventory',
  severity: 'warning',
  linkView: 'inventoryList',
})`}</DocPre>
      <DocParagraph>
        When <Code>notifications</Code> is enabled and Airtable is connected, events are
        persisted and the header bell updates.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Dependencies & enable order
      </Typography>
      <List dense disablePadding sx={{ mb: 2 }}>
        <ListItem>
          <ListItemText primary="config" secondary="App Config table; no dependsOn." />
        </ListItem>
        <ListItem>
          <ListItemText primary="roles" secondary="dependsOn: config." />
        </ListItem>
        <ListItem>
          <ListItemText primary="users" secondary="dependsOn: config, roles." />
        </ListItem>
        <ListItem>
          <ListItemText primary="notifications" secondary="dependsOn: config." />
        </ListItem>
      </List>
      <DocParagraph>
        Declare <Code>dependsOn</Code> in your manifest so Enable provisions prerequisites
        and refuses out-of-order installs.
      </DocParagraph>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Bundled reference modules
      </Typography>
      <List dense disablePadding sx={{ mb: 2 }}>
        <ListItem>
          <ListItemText
            primary={<Code>modules/config/</Code>}
            secondary="Key–value settings, module.*.enabled, useModuleEnabled."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<Code>modules/roles/</Code>}
            secondary="Roles, permissions, linked records, full list CRUD pattern."
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={<Code>modules/users/</Code>} secondary="OAuth or custom auth users." />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<Code>modules/notifications/</Code>}
            secondary="Pub/sub bus, header slot, Airtable persistence."
          />
        </ListItem>
      </List>

      <Typography variant="body2" color="text.secondary">
        Repo copy of this guide: <Code>docs/modules.md</Code>. Module folder readme:{' '}
        <Code>modules/README.md</Code>.
      </Typography>
    </DocSection>
  )
}
