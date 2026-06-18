import apiClient from './apiClient'
import type { ApiResponse, Notification } from '../types'

export const notificationService = {
  getAll: () => apiClient.get<ApiResponse<Notification[]>>('/notifications'),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAllRead: () => apiClient.post<ApiResponse<void>>('/notifications/mark-all-read'),

  markRead: (id: string) => apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`),
}
