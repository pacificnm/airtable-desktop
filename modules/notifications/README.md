# Notifications module

Persists in-app notifications to Airtable and exposes a header bell with unread badge.

## Publishing from other modules

```ts
import { publishNotification } from '../../src/lib/notifications/index.ts'

publishNotification({
  title: 'Role updated',
  body: 'The Admin role was changed.',
  sourceModule: 'roles',
  severity: 'info',
  eventType: 'role.updated',
  linkView: 'rolesList',
  metadata: { roleId: 'recXXX' },
})
```

When this module is enabled and Airtable is connected, `NotificationBusBridge` subscribes to the bus and creates rows in the **Notifications** table.

## Header slot

The module registers a `headerSlots` entry (bell + menu). Core renders enabled slots in `HeaderActions` before the user avatar. Slots use `useHeaderSlotContext()` for `onNavigate`.

## Enable

Add `notifications` to `src/config/enabledModules.ts` or use **Developer → Modules**. Depends on **config**.
