export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationsQueryKeys.all, 'list'] as const,
  unreadCount: () => [...notificationsQueryKeys.all, 'unreadCount'] as const,
}
