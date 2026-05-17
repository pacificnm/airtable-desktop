import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import { Action } from '../button/Action.tsx'
import { useState, type ReactNode } from 'react'

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  )
}

function PaletteSwatch({
  name,
  color,
  textColor = '#fff',
}: {
  name: string
  color: string
  textColor?: string
}) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          height: 48,
          bgcolor: color,
          color: textColor,
          display: 'flex',
          alignItems: 'flex-end',
          p: 0.75,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        component="code"
        sx={{ display: 'block', p: 0.75, fontSize: '0.65rem' }}
      >
        {color}
      </Typography>
    </Paper>
  )
}

function PaletteSection() {
  const theme = useTheme()
  const { palette } = theme

  const chips: { name: string; color: string; text?: string }[] = [
    { name: 'primary.main', color: palette.primary.main },
    { name: 'primary.dark', color: palette.primary.dark },
    { name: 'primary.light', color: palette.primary.light, text: '#1A1A1A' },
    { name: 'secondary.main', color: palette.secondary.main },
    { name: 'secondary.light', color: palette.secondary.light },
    { name: 'error.main', color: palette.error.main },
    { name: 'error.light', color: palette.error.light ?? '#FFD4E0', text: '#1A1A1A' },
    { name: 'warning.main', color: palette.warning.main, text: '#1A1A1A' },
    { name: 'success.main', color: palette.success.main },
    { name: 'success.light', color: palette.success.light ?? '#E6FCE8', text: '#1A1A1A' },
    { name: 'background.default', color: palette.background.default, text: palette.text.primary },
    { name: 'background.paper', color: palette.background.paper, text: palette.text.primary },
    { name: 'text.primary', color: palette.text.primary },
    { name: 'text.secondary', color: palette.text.secondary },
    { name: 'divider', color: String(palette.divider), text: palette.text.primary },
  ]

  const grey = palette.grey as unknown as Record<string, string>

  return (
    <>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {chips.map((c) => (
          <Grid key={c.name} size={{ xs: 6, sm: 4, md: 3 }}>
            <PaletteSwatch
              name={c.name}
              color={c.color}
              textColor={c.text ?? '#FFFFFF'}
            />
          </Grid>
        ))}
      </Grid>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Grey scale
      </Typography>
      <Grid container spacing={1}>
        {Object.entries(grey)
          .filter(([k]) => !Number.isNaN(Number(k)))
          .map(([step, color]) => (
            <Grid key={step} size={{ xs: 4, sm: 2, md: 1.5 }}>
              <PaletteSwatch
                name={`grey.${step}`}
                color={color}
                textColor={Number(step) >= 500 ? '#fff' : '#1A1A1A'}
              />
            </Grid>
          ))}
      </Grid>
    </>
  )
}

function TypographySection() {
  const samples = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'button',
    'overline',
  ] as const

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {samples.map((variant) => (
        <Typography key={variant} variant={variant} gutterBottom>
          {variant} — The quick brown fox
        </Typography>
      ))}
    </Paper>
  )
}

/** Live preview of `src/theme.ts` via MUI components. */
export function MuiThemePreview() {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Rendered with the active MUI theme from <code>src/theme.ts</code> (border
        radius {theme.shape.borderRadius}px, font{' '}
        {theme.typography.fontFamily}).
      </Typography>

      <Section title="Palette">
        <PaletteSection />
      </Section>

      <Section title="Typography">
        <TypographySection />
      </Section>

      <Section title="Buttons">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Action>Action (primary CTA)</Action>
          <Button variant="contained" color="primary">
            Contained
          </Button>
          <Button variant="outlined" color="primary">
            Outlined
          </Button>
          <Button variant="text" color="primary">
            Text
          </Button>
          <Button variant="contained" color="secondary" size="small">
            Small
          </Button>
          <Button variant="contained" color="error">
            Error
          </Button>
        </Box>
      </Section>

      <Section title="Chips & alerts">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Chip label="Default" size="small" />
          <Chip label="Primary" color="primary" size="small" />
          <Chip label="Outlined" variant="outlined" size="small" />
        </Box>
        <Alert severity="info" sx={{ mb: 1 }}>
          Info alert
        </Alert>
        <Alert severity="success">Success alert</Alert>
      </Section>

      <Section title="Inputs">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 360 }}>
          <TextField label="Text field" placeholder="Placeholder" />
          <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
        </Box>
      </Section>

      <Section title="Tabs">
        <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
          <Tab label="Tab one" />
          <Tab label="Tab two" />
          <Tab label="Tab three" />
        </Tabs>
      </Section>

      <Section title="Card & table">
        <Card sx={{ mb: 2, maxWidth: 480 }}>
          <CardContent>
            <Typography variant="subtitle1">Card title</Typography>
            <Typography variant="body2" color="text.secondary">
              Card uses theme border and zero radius.
            </Typography>
          </CardContent>
        </Card>
        <TableContainerSample />
      </Section>
    </Box>
  )
}

function TableContainerSample() {
  return (
    <Paper variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover>
            <TableCell>Sample row</TableCell>
            <TableCell>
              <Chip label="Active" size="small" color="primary" />
            </TableCell>
          </TableRow>
          <TableRow hover selected>
            <TableCell>Selected row</TableCell>
            <TableCell>Hover styles from theme</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  )
}
