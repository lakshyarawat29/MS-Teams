import apiClient from './apiClient'
import type { ApiResponse, User } from '../types'

export const userService = {
  getMe: () => apiClient.get<ApiResponse<User>>('/users/me'),

  getById: (userId: string) => apiClient.get<ApiResponse<User>>(`/users/${userId}`),

  updateProfile: (data: { firstName: string; lastName: string; bio?: string }) =>
    apiClient.put<ApiResponse<User>>('/users/me', data),

  updateStatus: (status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY') =>
    apiClient.patch<ApiResponse<User>>('/users/me/status', { status }),

  search: (q: string) => apiClient.get<ApiResponse<User[]>>(`/users/search?q=${encodeURIComponent(q)}`),
}
