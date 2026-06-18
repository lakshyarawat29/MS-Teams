import apiClient from './apiClient'
import type { ApiResponse, Channel } from '../types'

export const channelService = {
  createChannel: (data: { teamId: string; name: string; description?: string }) =>
    apiClient.post<ApiResponse<Channel>>('/channels', data),

  getChannelById: (channelId: string) =>
    apiClient.get<ApiResponse<Channel>>(`/channels/${channelId}`),

  deleteChannel: (channelId: string) =>
    apiClient.delete<ApiResponse<void>>(`/channels/${channelId}`),
}
