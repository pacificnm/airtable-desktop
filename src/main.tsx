import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { applyThemeToDocument } from './lib/theme/applyTheme.ts'
import { getThemeDefinition } from './lib/theme/definitions/index.ts'
import { readThemeId } from './lib/theme/themePreferences.ts'
import { installDebugInstrumentation } from './lib/debug/installDebugInstrumentation.ts'

applyThemeToDocument(getThemeDefinition(readThemeId()))
import { isDebugEnabled } from './lib/env/isDebugEnabled.ts'
import App from './App.tsx'
import { AirtableProvider } from './context/AirtableAuthContext.tsx'
import { QueryProvider } from './context/QueryProvider.tsx'
import { ModuleTableIdHydrator } from './lib/modules/ModuleTableIdHydrator.tsx'
import { AppErrorBoundary } from './components/main/AppErrorBoundary.tsx'

if (isDebugEnabled()) {
  installDebugInstrumentation()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AirtableProvider>
        <QueryProvider>
          <ModuleTableIdHydrator />
          <App />
        </QueryProvider>
      </AirtableProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
