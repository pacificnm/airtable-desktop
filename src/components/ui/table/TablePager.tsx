import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export interface TablePagerProps {
  /** 0-based page index. */
  page: number
  pageSize: number
  /** True when Airtable returned an `offset` (more pages exist). */
  hasNextPage: boolean
  /** Number of rows on the current page (for display). */
  rowsOnPage: number
  pageSizeOptions?: readonly number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  disabled?: boolean
}

const DEFAULT_PAGE_SIZES = [25, 50, 100] as const

/**
 * Lightweight prev/next pager for Airtable offset-based pagination.
 * Total count is unknown, so we show page index + rows on current page.
 */
export function TablePager({
  page,
  pageSize,
  hasNextPage,
  rowsOnPage,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: TablePagerProps) {
  const startIndex = page * pageSize + (rowsOnPage > 0 ? 1 : 0)
  const endIndex = page * pageSize + rowsOnPage

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        py: 1,
        px: 1.5,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <FormControl size="small" sx={{ minWidth: 120 }} disabled={disabled}>
        <InputLabel id="table-pager-size-label">Rows per page</InputLabel>
        <Select
          labelId="table-pager-size-label"
          label="Rows per page"
          value={pageSize}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isFinite(next) && next > 0) onPageSizeChange(next)
          }}
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="caption" color="text.secondary">
        {rowsOnPage > 0
          ? `Page ${page + 1} · rows ${startIndex}–${endIndex}`
          : 'No rows'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 0}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !hasNextPage}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}
