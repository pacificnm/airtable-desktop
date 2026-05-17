import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import {
  appThemes,
  getThemeDefinition,
  type AppThemeDefinition,
} from '../lib/theme/definitions/index.ts'
import { applyThemeToDocument } from '../lib/theme/applyTheme.ts'
import { createMuiThemeFromDefinition } from '../lib/theme/createMuiTheme.ts'
import { readThemeId, writeThemeId } from '../lib/theme/themePreferences.ts'

type AppThemeContextValue = {
  themeId: string
  theme: AppThemeDefinition
  themes: readonly AppThemeDefinition[]
  setThemeId: (id: string) => void
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null)

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(() => readThemeId())
  const definition = useMemo(() => getThemeDefinition(themeId), [themeId])
  const muiTheme = useMemo(
    () => createMuiThemeFromDefinition(definition),
    [definition],
  )

  useEffect(() => {
    applyThemeToDocument(definition)
  }, [definition])

  const setThemeId = useCallback((id: string) => {
    const next = getThemeDefinition(id)
    writeThemeId(next.id)
    setThemeIdState(next.id)
  }, [])

  const value = useMemo<AppThemeContextValue>(
    () => ({
      themeId: definition.id,
      theme: definition,
      themes: appThemes,
      setThemeId,
    }),
    [definition, setThemeId],
  )

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  )
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext)
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider')
  return ctx
}
