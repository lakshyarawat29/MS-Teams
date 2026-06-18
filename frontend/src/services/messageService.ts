import apiClient from './apiClient'
import type { ApiResponse, Message, ReactionSummary } from '../types'

export const messageService = {
  sendMessage: (data: { channelId: string; content: string }) =>
    apiClient.post<ApiResponse<Message>>('/messages', data),

  getMessages: (channelId: string, page = 0, size = 50) =>
    apiClient.get<ApiResponse<Message[]>>(
      `/messages/channel/${channelId}?page=${page}&size=${size}`
    ),

  editMessage: (messageId: string, content: string) =>
    apiClient.put<ApiResponse<Message>>(`/messages/${messageId}`, { content }),

  deleteMessage: (messageId: string) =>
    apiClient.delete<ApiResponse<void>>(`/messages/${messageId}`),

  addReaction: (messageId: string, emoji: string) =>
    apiClient.post<ApiResponse<ReactionSummary[]>>(`/messages/${messageId}/reactions`, { emoji }),

  removeReaction: (messageId: string, emoji: string) =>
    apiClient.delete<ApiResponse<ReactionSummary[]>>(
      `/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`
    ),
}

