import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import { appThemes } from '../../lib/theme/definitions/index.ts'
import { useAppTheme } from '../../context/AppThemeProvider.tsx'

export function ThemeRegistryPanel() {
  const { themeId, setThemeId } = useAppTheme()

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Registered themes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add themes in <code>src/lib/theme/definitions/</code> and register them in{' '}
        <code>index.ts</code>. See <code>docs/themes.md</code>.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {appThemes.map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            onClick={() => setThemeId(t.id)}
            color={t.id === themeId ? 'primary' : 'default'}
            variant={t.id === themeId ? 'filled' : 'outlined'}
            title={t.description}
          />
        ))}
      </Box>
    </Paper>
  )
}
