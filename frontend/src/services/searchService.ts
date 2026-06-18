import apiClient from './apiClient'
import type { ApiResponse } from '../types'

interface SearchResults {
  messages: Array<{
    id: string
    channelId: string
    senderId: string
    senderFirstName: string
    senderLastName: string
    content: string
    createdAt: string
  }>
  channels: Array<{
    id: string
    teamId: string
    name: string
    description?: string
  }>
  users: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    status: string
  }>
}

export const searchService = {
  search: (q: string, type = 'all') =>
    apiClient.get<ApiResponse<SearchResults>>(`/search?q=${encodeURIComponent(q)}&type=${type}`),
}
