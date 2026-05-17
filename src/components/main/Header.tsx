import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import { HeaderActions } from './HeaderActions.tsx'
import { HeaderSlotProvider } from './HeaderSlotProvider.tsx'
import { UserAvatar } from './UserAvatar.tsx'
import { MenuButton } from '../button/Menu.tsx'
import { MainMenu } from './Menu.tsx'
import { Title } from './Title.tsx'
import { MainTabs } from './Tabs.tsx'
import type { AppView } from './appView.ts'
import { headerTabs } from '../../config/tabs.ts'
import {
  getHeaderTabIndex,
  resolveHeaderTabNavigate,
} from '../../config/tabs.ts'

export type { AppView } from './appView.ts'

interface HeaderProps {
  view: AppView
  onViewChange: (view: AppView) => void
}

export function Header({ view, onViewChange }: HeaderProps) {
  const tabValue = getHeaderTabIndex(view)
  const [menuOpen, setMenuOpen] = useState(false)
  const showTabs = headerTabs.length > 0

  return (
    <AppBar position="static" sx={{ bgcolor: 'var(--app-chrome-bg)' }}>
      <Toolbar sx={{ gap: 3, minHeight: { xs: 56 } }}>
        <MenuButton onClick={() => setMenuOpen(true)} />

        <MainMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          view={view}
          onViewChange={onViewChange}
        />

        <Title />

        {showTabs && tabValue !== false ? (
          <MainTabs
            value={tabValue}
            onSelect={(index) =>
              onViewChange(resolveHeaderTabNavigate(index, view))
            }
          />
        ) : null}

        <Box sx={{ flex: 1 }} />
        <HeaderSlotProvider onNavigate={onViewChange}>
          <HeaderActions />
        </HeaderSlotProvider>
        <UserAvatar />
      </Toolbar>
    </AppBar>
  )
}
