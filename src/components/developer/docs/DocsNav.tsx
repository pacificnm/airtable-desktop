import { Fragment } from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Paper from '@mui/material/Paper'
import type { DocSectionId } from '../../../content/developerDocs/types.ts'
import { developerDocsNav } from '../../../config/developerDocsNav.ts'

export interface DocsNavProps {
  activeId: DocSectionId
  onSelect: (id: DocSectionId) => void
}

export function DocsNav({ activeId, onSelect }: DocsNavProps) {
  return (
    <Paper
      component="nav"
      aria-label="Documentation"
      elevation={0}
      sx={{
        width: { xs: '100%', sm: 220 },
        flexShrink: 0,
        border: 1,
        borderColor: 'divider',
        alignSelf: 'flex-start',
        position: { sm: 'sticky' },
        top: { sm: 0 },
        maxHeight: { sm: 'calc(100vh - 12rem)' },
        overflow: 'auto',
      }}
    >
      <List dense disablePadding sx={{ py: 0.5 }}>
        {developerDocsNav.map((group) => (
          <Fragment key={group.id}>
            <ListSubheader
              sx={{
                lineHeight: 2,
                bgcolor: 'transparent',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {group.label}
            </ListSubheader>
            {group.items.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeId === item.id}
                onClick={() => onSelect(item.id)}
                sx={{ py: 0.75, pl: 2 }}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItemButton>
            ))}
          </Fragment>
        ))}
      </List>
    </Paper>
  )
}
