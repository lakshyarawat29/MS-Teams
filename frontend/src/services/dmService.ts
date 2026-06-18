import apiClient from './apiClient'
import type { ApiResponse, Conversation, DirectMessage } from '../types'

export const dmService = {
  getConversations: () =>
    apiClient.get<ApiResponse<Conversation[]>>('/dm/conversations'),

  openConversation: (userId: string) =>
    apiClient.post<ApiResponse<Conversation>>(`/dm/conversations/${userId}`),

  sendMessage: (recipientId: string, content: string) =>
    apiClient.post<ApiResponse<DirectMessage>>('/dm', { recipientId, content }),

  getMessages: (conversationId: string, page = 0, size = 50) =>
    apiClient.get<ApiResponse<DirectMessage[]>>(
      `/dm/conversations/${conversationId}/messages?page=${page}&size=${size}`
    ),
}
