import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { getScreenTitle } from '../config/screens.ts'
import { MuiThemePreview } from '../components/developer/MuiThemePreview.tsx'
import { ThemeRegistryPanel } from '../components/developer/ThemeRegistryPanel.tsx'

export default function DeveloperTheme() {
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        {getScreenTitle('devTheme')}
      </Typography>
      <ThemeRegistryPanel />
      <MuiThemePreview />
    </Box>
  )
}
