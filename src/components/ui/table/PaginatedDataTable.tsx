import Box from '@mui/material/Box'
import { DataTable, type DataTableProps } from './DataTable.tsx'
import { TablePager } from './TablePager.tsx'
import type { TablePagerProps } from './TablePager.tsx'

export interface PaginatedDataTableProps<T>
  extends DataTableProps<T>,
    Pick<
      TablePagerProps,
      | 'page'
      | 'pageSize'
      | 'hasNextPage'
      | 'rowsOnPage'
      | 'pageSizeOptions'
      | 'onPageChange'
      | 'onPageSizeChange'
      | 'disabled'
    > {
  /**
   * When true, the table bleeds to the horizontal edges of a parent with `p: 3`
   * (embedded panels / flyouts). Pagination stays in the normal content gutter.
   */
  bleed?: boolean
  /** When false, only the table is shown. Defaults to true. */
  showPager?: boolean
}

/**
 * Standard layout: `DataTable` then `TablePager` directly below (pager is never
 * inside the table `Paper`). Matches {@link RecordListPage} `footer` + table
 * children on list screens.
 */
export function PaginatedDataTable<T>({
  bleed = false,
  showPager = true,
  page,
  pageSize,
  hasNextPage,
  rowsOnPage,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  disabled,
  ...tableProps
}: PaginatedDataTableProps<T>) {
  const table = <DataTable {...tableProps} />

  return (
    <Box>
      {bleed ? (
        <Box sx={{ px: 3 }}>
          <Box sx={{ mx: -3 }}>{table}</Box>
        </Box>
      ) : (
        table
      )}
      {showPager ? (
        <TablePager
          page={page}
          pageSize={pageSize}
          hasNextPage={hasNextPage}
          rowsOnPage={rowsOnPage}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          disabled={disabled}
        />
      ) : null}
    </Box>
  )
}
