import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { getScreenTitle } from '../config/screens.ts'
import { CssTokensPreview } from '../components/developer/CssTokensPreview.tsx'

export default function DeveloperTokens() {
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        {getScreenTitle('devTokens')}
      </Typography>
      <CssTokensPreview />
    </Box>
  )
}
