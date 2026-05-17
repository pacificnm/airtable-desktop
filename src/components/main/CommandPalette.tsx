import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import type { AppView } from './appView.ts'
import { menuIcons } from './menuIcons.tsx'
import {
  getCommandPaletteItems,
  type CommandPaletteItem,
} from '../../lib/navigation/commandPaletteItems.ts'
import { filterCommandPaletteItems } from '../../lib/navigation/filterCommandPaletteItems.ts'

const PALETTE_ITEMS = getCommandPaletteItems()

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  view: AppView
  onNavigate: (view: AppView) => void
}

function CommandPaletteContent({
  onClose,
  view,
  onNavigate,
}: Omit<CommandPaletteProps, 'open'>) {
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)

  const filtered = useMemo(
    () => filterCommandPaletteItems(PALETTE_ITEMS, query),
    [query],
  )

  const activeIndex = Math.min(
    highlightIndex,
    Math.max(0, filtered.length - 1),
  )

  const selectItem = useCallback(
    (item: CommandPaletteItem) => {
      onNavigate(item.resolveNavigate(view))
      onClose()
    },
    [onClose, onNavigate, view],
  )

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault()
      selectItem(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <DialogContent sx={{ p: 0 }} onKeyDown={handleKeyDown}>
      <TextField
        autoFocus
        fullWidth
        placeholder="Go to screen…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="standard"
        slotProps={{
          input: {
            sx: {
              px: 2,
              py: 1.5,
              color: '#FFFFFF',
              fontSize: '1rem',
              '&::placeholder': { color: 'rgba(255,255,255,0.45)', opacity: 1 },
            },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          '& .MuiInput-underline:before': { borderBottom: 'none' },
          '& .MuiInput-underline:after': {
            borderBottomColor: 'var(--app-chrome-accent)',
          },
        }}
      />
      <List
        dense
        sx={{
          maxHeight: 320,
          overflow: 'auto',
          py: 0.5,
        }}
        role="listbox"
      >
        {filtered.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ px: 2, py: 2, color: 'rgba(255,255,255,0.45)' }}
          >
            No matching screens.
          </Typography>
        ) : (
          filtered.map((item, index) => {
            const prev = filtered[index - 1]
            const showSection = !prev || prev.section !== item.section
            const Icon = menuIcons[item.icon]
            return (
              <Fragment key={item.id}>
                {showSection ? (
                  <ListSubheader
                    disableSticky
                    sx={{
                      bgcolor: 'transparent',
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      lineHeight: 2,
                    }}
                  >
                    {item.section}
                  </ListSubheader>
                ) : null}
                <ListItemButton
                  selected={index === activeIndex}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => setHighlightIndex(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  sx={{
                    py: 0.75,
                    color: '#CAD1D3',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0,63,45,0.55)',
                      color: 'var(--app-chrome-accent)',
                      '&:hover': { bgcolor: 'rgba(0,63,45,0.65)' },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.06)',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: { sx: { fontSize: '0.875rem', fontWeight: 500 } },
                    }}
                  />
                </ListItemButton>
              </Fragment>
            )
          })
        )}
      </List>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          px: 2,
          py: 1,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        ↑↓ navigate · Enter open · Esc close
      </Typography>
    </DialogContent>
  )
}

export function CommandPalette({
  open,
  onClose,
  view,
  onNavigate,
}: CommandPaletteProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'var(--app-chrome-bg)',
            color: 'var(--app-chrome-fg)',
            borderRadius: 2,
            overflow: 'hidden',
          },
        },
      }}
    >
      {open ? (
        <CommandPaletteContent onClose={onClose} view={view} onNavigate={onNavigate} />
      ) : null}
    </Dialog>
  )
}
