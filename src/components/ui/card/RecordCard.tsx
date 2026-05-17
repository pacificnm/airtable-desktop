import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import type { RecordCardField, RecordRowActions } from '../record/recordTypes.ts'

export interface RecordCardProps<T> {
  row: T
  title: ReactNode
  subtitle?: ReactNode
  fields?: readonly RecordCardField<T>[]
  footer?: ReactNode
  onClick?: () => void
  rowActions?: RecordRowActions<T>
}

export function RecordCard<T>({
  row,
  title,
  subtitle,
  fields,
  footer,
  onClick,
  rowActions,
}: RecordCardProps<T>) {
  const editLabel = rowActions?.editAriaLabel?.(row) ?? 'Edit'
  const deleteLabel = rowActions?.deleteAriaLabel?.(row) ?? 'Delete'

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: (theme) =>
          theme.transitions.create(['background-color', 'border-color']),
        '&:hover': onClick
          ? {
              bgcolor: 'action.hover',
              borderColor: 'primary.light',
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          mb: fields?.length || subtitle ? 1.5 : 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            component="div"
            sx={{ fontWeight: 600, lineHeight: 1.3 }}
            noWrap
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {rowActions ? (
          <Box
            sx={{ flexShrink: 0, ml: -0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              aria-label={editLabel}
              onClick={() => rowActions.onEdit(row)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label={deleteLabel}
              onClick={() => rowActions.onDelete(row)}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : null}
      </Box>

      {fields?.length ? (
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gap: 1,
            flex: 1,
          }}
        >
          {fields.map((field) => (
            <Box key={field.id} sx={{ minWidth: 0 }}>
              <Typography
                component="dt"
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontWeight: 500, mb: 0.25 }}
              >
                {field.label}
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                {field.render(row)}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}

      {footer ? (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>{footer}</Box>
      ) : null}
    </Paper>
  )
}
