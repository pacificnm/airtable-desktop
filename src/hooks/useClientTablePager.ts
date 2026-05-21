import { useMemo, useState } from 'react'

const DEFAULT_PAGE_SIZE = 25

export interface UseClientTablePagerOptions {
  defaultPageSize?: number
}

/** Client-side slice pagination for in-memory record lists. */
export function useClientTablePager<T>(
  rows: readonly T[],
  options: UseClientTablePagerOptions = {},
) {
  const defaultPageSize = options.defaultPageSize ?? DEFAULT_PAGE_SIZE
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const maxPage = Math.max(0, Math.ceil(rows.length / pageSize) - 1)
  const resetKey = `${pageSize}\0${rows.length}\0${rows}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    if (page !== 0) setPage(0)
  } else if (page > maxPage) {
    setPage(maxPage)
  }

  const pageRows = useMemo(
    () => rows.slice(page * pageSize, page * pageSize + pageSize),
    [rows, page, pageSize],
  )

  const hasNextPage = (page + 1) * pageSize < rows.length

  const onPageSizeChange = (next: number) => {
    setPageSize(next)
    setPage(0)
  }

  return {
    page,
    pageSize,
    pageRows,
    hasNextPage,
    rowsOnPage: pageRows.length,
    setPage,
    onPageSizeChange,
  }
}
