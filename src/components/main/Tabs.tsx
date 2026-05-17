import MuiTabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import type { TabsProps } from '@mui/material/Tabs'
import type { SxProps, Theme } from '@mui/material/styles'
import { headerTabs } from '../../config/tabs.ts'

const shellTabsSx: SxProps<Theme> = {
  ml: 2,
  minHeight: 40,
  '& .MuiTab-root': {
    color: '#CAD1D3',
    '&.Mui-selected': { color: '#FFFFFF' },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--app-chrome-accent)',
  },
}

export interface MainTabsProps {
  value: TabsProps['value']
  /** Fired with the selected tab index (never `false`). */
  onSelect: (index: number) => void
  sx?: TabsProps['sx']
}

/**
 * App bar tab strip with shell styling (dark bar, mint indicator).
 * Tab labels and order come from {@link headerTabs} in `src/config/tabs.ts`.
 */
export function MainTabs({ value, onSelect, sx }: MainTabsProps) {
  return (
    <MuiTabs
      value={value}
      onChange={(_, v) => {
        if (v === false) return
        onSelect(v as number)
      }}
      sx={[
        shellTabsSx,
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {headerTabs.map((tab) => (
        <Tab key={tab.id} label={tab.label} sx={{ minHeight: 40 }} />
      ))}
    </MuiTabs>
  )
}
