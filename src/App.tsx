import { useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import { AppThemeProvider } from './context/AppThemeProvider.tsx'
import { AppErrorBoundary } from './components/main/AppErrorBoundary.tsx'
import { Header } from './components/main/Header.tsx'
import {
  CommandPalette,
} from './components/main/CommandPalette.tsx'
import { useCommandPaletteShortcut } from './hooks/useCommandPaletteShortcut.ts'
import { ScreenRouter } from './components/main/ScreenRouter.tsx'
import { DebugNavigateClear } from './components/debug/DebugNavigateClear.tsx'
import { DebugPanel } from './components/debug/DebugPanel.tsx'
import { ElectronAppMenuBridge } from './components/main/ElectronAppMenuBridge.tsx'
import { ElectronMenuSync } from './components/main/ElectronMenuSync.tsx'
import { DebugProvider, useDebug } from './context/DebugContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import type { AppView } from './components/main/appView.ts'
import { isDebugEnabled } from './lib/env/isDebugEnabled.ts'
import { OAuthRedirectHandler } from './components/airtable/OAuthRedirectHandler.tsx'
import { usePersistedAppView } from './lib/navigation/appViewPersistence.ts'
import { isModuleEnabled } from './lib/modules/registry.ts'
import { NotificationModuleBridge } from '../modules/notifications/components/NotificationModuleBridge.tsx'

const debugUiEnabled = isDebugEnabled()

function AppShell({
  view,
  onViewChange,
}: {
  view: AppView
  onViewChange: (view: AppView) => void
}) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  useCommandPaletteShortcut(setPaletteOpen)

  return (
    <>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        view={view}
        onNavigate={onViewChange}
      />
      {debugUiEnabled ? <DebugNavigateClear view={view} /> : null}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          bgcolor: 'background.default',
        }}
      >
        <Header view={view} onViewChange={onViewChange} />
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            p: 3,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AppErrorBoundary variant="content">
            <ScreenRouter view={view} />
          </AppErrorBoundary>
        </Box>
      </Box>
    </>
  )
}

function MaybeDebugShell({
  children,
  onNavigate,
}: {
  children: ReactNode
  onNavigate: (view: AppView) => void
}) {
  if (!debugUiEnabled) {
    return (
      <>
        <ElectronAppMenuBridge onNavigate={onNavigate} />
        {children}
      </>
    )
  }
  return (
    <DebugProvider>
      <DebugMenuBridge onNavigate={onNavigate} />
      {children}
      <DebugPanel />
    </DebugProvider>
  )
}

function DebugMenuBridge({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const { setOpen } = useDebug()
  return (
    <ElectronAppMenuBridge
      onNavigate={onNavigate}
      onOpenDebugPanel={() => setOpen(true)}
    />
  )
}

export default function App() {
  const [view, setView] = usePersistedAppView()

  return (
    <AppThemeProvider>
      <ToastProvider>
        <OAuthRedirectHandler />
        <ElectronMenuSync />
        {isModuleEnabled('notifications') ? <NotificationModuleBridge /> : null}
        <MaybeDebugShell onNavigate={setView}>
          <AppShell view={view} onViewChange={setView} />
        </MaybeDebugShell>
      </ToastProvider>
    </AppThemeProvider>
  )
}
