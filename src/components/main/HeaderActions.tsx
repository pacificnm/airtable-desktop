import { lazy, Suspense, type ComponentType } from 'react'
import Stack from '@mui/material/Stack'
import { getModuleHeaderSlots } from '../../lib/modules/registry.ts'

function createSlotComponent(importSlot: () => Promise<{ default: ComponentType }>) {
  const Lazy = lazy(importSlot)
  return function HeaderSlotEntry() {
    return <Lazy />
  }
}

const slotEntries = getModuleHeaderSlots().map((slot) => ({
  key: slot.key,
  Component: createSlotComponent(slot.importSlot),
}))

/** Module-contributed toolbar actions (notifications bell, etc.) before the user avatar. */
export function HeaderActions() {
  if (slotEntries.length === 0) return null

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mr: 0.5 }}>
      {slotEntries.map(({ key, Component }) => (
        <Suspense key={key} fallback={null}>
          <Component />
        </Suspense>
      ))}
    </Stack>
  )
}
