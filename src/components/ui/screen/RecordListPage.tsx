import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { PageContainer } from '../../main/PageContainer.tsx'
import { PageHeader } from '../../main/PageHeader.tsx'
import { PageContents } from '../../main/PageContents.tsx'
import { Loading } from '../../main/Loading.tsx'
import { InlineError } from '../../main/InlineError.tsx'
import type { PageHeaderProps } from '../../main/PageHeader.tsx'
import type { RecordViewMode } from '../record/recordTypes.ts'
import { RecordViewToggle } from '../view/RecordViewToggle.tsx'

export interface RecordListPageProps {
  header: PageHeaderProps
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  banner?: ReactNode
  children?: ReactNode
  /** When set with `onViewModeChange`, shows grid/card toggle beside header actions. */
  viewMode?: RecordViewMode
  onViewModeChange?: (mode: RecordViewMode) => void
}

/** Standard list page shell: header, optional banner, loading/error, records slot. */
export function RecordListPage({
  header,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  banner,
  children,
  viewMode,
  onViewModeChange,
}: RecordListPageProps) {
  const showViewToggle = viewMode != null && onViewModeChange != null

  const headerWithToggle: PageHeaderProps = showViewToggle
    ? {
        ...header,
        action: (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <RecordViewToggle value={viewMode} onChange={onViewModeChange} />
            {header.action}
          </Stack>
        ),
      }
    : header

  return (
    <PageContainer>
      <PageHeader {...headerWithToggle} />
      <PageContents>
        {banner}
        {isLoading ? <Loading /> : null}
        {isError ? (
          <InlineError
            message={errorMessage ?? 'Failed to load records'}
            onRetry={onRetry ? () => void onRetry() : undefined}
          />
        ) : null}
        {!isLoading && !isError ? children : null}
      </PageContents>
    </PageContainer>
  )
}
