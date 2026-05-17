/** @deprecated Import `createMuiThemeFromDefinition` or use `AppThemeProvider` instead. */
import { createMuiThemeFromDefinition } from './lib/theme/createMuiTheme.ts'
import { lightTheme } from './lib/theme/definitions/light.ts'

export default createMuiThemeFromDefinition(lightTheme)
