import apiClient from './apiClient'
import type { ApiResponse, AuthResponse } from '../types'

export const authService = {
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<void>>('/auth/logout', { refreshToken }),
}
