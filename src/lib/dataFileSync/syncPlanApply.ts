/** Plan row that can be written to Airtable (invalid rows are skipped on apply). */
export function applyableSyncPlanItems<T extends { action: string }>(
  items: readonly T[],
): T[] {
  return items.filter((item) => item.action === 'create' || item.action === 'update')
}

export function canApplyPartialDataFileSyncPlan(summary: {
  create: number
  update: number
}): boolean {
  return summary.create + summary.update > 0
}
