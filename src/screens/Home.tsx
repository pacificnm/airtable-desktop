import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { EmptyState } from '../components/main/EmptyState.tsx'
import { getScreenTitle } from '../config/screens.ts'
import { useAirtable } from '../hooks/useAirtable.ts'

export default function Home() {
  const { isReady } = useAirtable()

  if (!isReady) {
    return (
      <EmptyState
        icon={<LinkOffOutlinedIcon />}
        title="Connect your Airtable base"
        description={
          <>
            Open the menu (☰) → <strong>Airtable connection</strong>, enter your base id
            and personal access token or sign in with OAuth, then save.
          </>
        }
      />
    )
  }

  return (
    <EmptyState
      overline={getScreenTitle('home')}
      icon={<HomeOutlinedIcon />}
      title={`Welcome to ${__APP_DISPLAY_NAME__}`}
      description="This is a starter shell for Airtable-backed desktop apps. Connect your base, generate table config from Developer → Tables, then add screens and routes as your product grows."
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center',
        }}
      >
        <Chip
          size="small"
          label="Airtable connected"
          sx={{
            bgcolor: 'var(--app-status-connected-bg)',
            color: 'primary.main',
            fontWeight: 500,
          }}
        />
        <Chip
          size="small"
          variant="outlined"
          label="Developer → Documentation"
          sx={{ borderColor: 'divider' }}
        />
        <Chip
          size="small"
          variant="outlined"
          label="Developer → Tables"
          sx={{ borderColor: 'divider' }}
        />
        <Chip
          size="small"
          variant="outlined"
          label="Tokens & theme"
          sx={{ borderColor: 'divider' }}
        />
      </Box>
    </EmptyState>
  )
}
