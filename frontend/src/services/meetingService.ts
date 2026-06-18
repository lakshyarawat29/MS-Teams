import apiClient from './apiClient'
import type { ApiResponse } from '../types'
import type { Meeting } from '../types'

export const meetingService = {
  createMeeting: (data: {
    title: string
    description?: string
    teamId?: string
    startTime: string
    endTime: string
    participantIds?: string[]
  }) => apiClient.post<ApiResponse<Meeting>>('/meetings', data),

  getUpcoming: () =>
    apiClient.get<ApiResponse<Meeting[]>>('/meetings'),

  getMeeting: (id: string) =>
    apiClient.get<ApiResponse<Meeting>>(`/meetings/${id}`),

  deleteMeeting: (id: string) =>
    apiClient.delete(`/meetings/${id}`),
}
