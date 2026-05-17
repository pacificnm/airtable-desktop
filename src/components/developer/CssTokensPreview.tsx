import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import {
  cssTokenGroups,
  readCssToken,
  type CssTokenDef,
  type CssTokenGroup,
} from '../../lib/theme/cssTokenCatalog.ts'

function ColorSwatch({ token }: { token: CssTokenDef }) {
  const value = readCssToken(token.var)
  const isLight =
    token.var.includes('white') ||
    token.var.includes('system-10') ||
    token.var.includes('system-11')

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <Box
        sx={{
          height: 56,
          bgcolor: `var(${token.var})`,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      />
      <Box sx={{ p: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
          {token.label}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          component="code"
          sx={{ fontSize: '0.6rem', wordBreak: 'break-all' }}
        >
          {token.var}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.25,
            color: isLight ? 'text.primary' : 'text.secondary',
          }}
        >
          {value || '—'}
        </Typography>
      </Box>
    </Paper>
  )
}

function FontFamilySample({ token }: { token: CssTokenDef }) {
  const value = readCssToken(token.var)
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography
        sx={{
          fontFamily: `var(${token.var})`,
          fontSize: '1.25rem',
          mb: 0.5,
        }}
      >
        The quick brown fox
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {token.label}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        component="code"
        sx={{ fontSize: '0.65rem', display: 'block' }}
      >
        {token.var}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {value}
      </Typography>
    </Paper>
  )
}

function FontSizeSample({ token }: { token: CssTokenDef }) {
  const value = readCssToken(token.var)
  return (
    <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'baseline', gap: 2 }}>
      <Typography sx={{ fontSize: `var(${token.var})`, fontFamily: 'var(--typography-fontFamily-sans)' }}>
        Aa
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {token.label} · {value}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          component="code"
          sx={{ fontSize: '0.65rem', display: 'block' }}
        >
          {token.var}
        </Typography>
      </Box>
    </Paper>
  )
}

function MetricSample({ token, kind }: { token: CssTokenDef; kind: 'spacing' | 'lineHeight' | 'weight' | 'shape' }) {
  const value = readCssToken(token.var)

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      {kind === 'spacing' && (
        <Box
          sx={{
            height: 8,
            width: `var(${token.var})`,
            maxWidth: '100%',
            bgcolor: 'primary.main',
            mb: 1,
          }}
        />
      )}
      {kind === 'lineHeight' && (
        <Typography
          sx={{
            fontFamily: 'var(--typography-fontFamily-sans)',
            fontSize: 'var(--typography-fontSize-14)',
            lineHeight: `var(${token.var})`,
            mb: 1,
          }}
        >
          Line height sample with wrapped text so you can compare leading.
        </Typography>
      )}
      {kind === 'weight' && (
        <Typography
          sx={{
            fontFamily: 'var(--typography-fontFamily-sans)',
            fontSize: 'var(--typography-fontSize-16)',
            fontWeight: `var(${token.var})`,
            mb: 1,
          }}
        >
          Weight {token.label}
        </Typography>
      )}
      {kind === 'shape' && (
        <Box
          sx={{
            width: 48,
            height: 48,
            border: `${readCssToken('--shape-borderWidth-default')} solid`,
            borderColor: 'primary.main',
            borderRadius: token.var.includes('Radius') ? `var(${token.var})` : 0,
            boxShadow: token.var.includes('Shadow') ? `var(${token.var})` : 'none',
            mb: 1,
          }}
        />
      )}
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {token.label}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        component="code"
        sx={{ fontSize: '0.65rem', display: 'block' }}
      >
        {token.var} → {value || '—'}
      </Typography>
    </Paper>
  )
}

function TokenGroupSection({ group }: { group: CssTokenGroup }) {
  const kind = group.id.startsWith('font-family')
    ? 'fontFamily'
    : group.id === 'font-size'
      ? 'fontSize'
      : group.id === 'font-weight'
        ? 'weight'
        : group.id === 'line-height'
          ? 'lineHeight'
          : group.id === 'spacing'
            ? 'spacing'
            : group.id === 'shape'
              ? 'shape'
              : 'color'

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {group.label}
      </Typography>
      <Grid container spacing={1.5}>
        {group.tokens.map((token) => (
          <Grid
            key={token.var}
            size={{
              xs: 12,
              sm: kind === 'color' ? 6 : 12,
              md: kind === 'color' ? 4 : 6,
            }}
          >
            {kind === 'color' && <ColorSwatch token={token} />}
            {kind === 'fontFamily' && <FontFamilySample token={token} />}
            {kind === 'fontSize' && <FontSizeSample token={token} />}
            {kind === 'weight' && (
              <MetricSample token={token} kind="weight" />
            )}
            {kind === 'lineHeight' && (
              <MetricSample token={token} kind="lineHeight" />
            )}
            {kind === 'spacing' && (
              <MetricSample token={token} kind="spacing" />
            )}
            {kind === 'shape' && <MetricSample token={token} kind="shape" />}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

/** Visual catalog of `src/tokens.css` custom properties. */
export function CssTokensPreview() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Live values from <code>src/tokens.css</code> (imported in{' '}
        <code>index.css</code>). Swatches use <code>var(--token)</code> so you see
        what the app actually resolves.
      </Typography>
      {cssTokenGroups.map((group) => (
        <TokenGroupSection key={group.id} group={group} />
      ))}
    </Box>
  )
}
