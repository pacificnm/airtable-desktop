import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { Action } from '../../../src/components/button/Action.tsx'
import {
  FormStack,
  FormTextField,
  SettingsPanel,
} from '../../../src/components/ui/index.ts'

export interface CustomSignInFormProps {
  onSignIn: (login: string, password: string) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function CustomSignInForm({
  onSignIn,
  loading = false,
  error,
}: CustomSignInFormProps) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  return (
    <SettingsPanel title="Sign in" sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: -0.5 }}>
        App Users table authentication
      </Typography>
      <FormStack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <FormTextField
          label="Email or username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
          disabled={loading}
        />
        <FormTextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />
        <Action
          fullWidth
          loading={loading}
          onClick={() => void onSignIn(login, password)}
        >
          Sign in
        </Action>
      </FormStack>
    </SettingsPanel>
  )
}
