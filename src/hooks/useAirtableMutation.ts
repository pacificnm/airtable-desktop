import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import { invalidateAirtableTable } from '../lib/query/invalidateAirtableTable.ts'
import type { TableKey } from '../config/tables.ts'

export type UseAirtableMutationOptions<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  tableKey: TableKey
  /** Refetch list/detail queries for this table after success (default true). */
  invalidateTable?: boolean
}

/**
 * `useMutation` that invalidates cached Airtable queries for a table on success.
 * Pair with your CRUD hook’s `create` / `update` / `remove` functions.
 */
export function useAirtableMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseAirtableMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient()
  const {
    tableKey,
    invalidateTable = true,
    onSuccess,
    ...rest
  } = options

  return useMutation({
    ...rest,
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidateTable) {
        await invalidateAirtableTable(queryClient, tableKey)
      }
      await onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}
