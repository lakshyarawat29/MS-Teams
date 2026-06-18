import apiClient from './apiClient'
import type { ApiResponse, Team, TeamMember } from '../types'

export const teamService = {
  createTeam: (data: { name: string; description?: string }) =>
    apiClient.post<ApiResponse<Team>>('/teams', data),

  getMyTeams: () => apiClient.get<ApiResponse<Team[]>>('/teams'),

  getAllTeams: () => apiClient.get<ApiResponse<Team[]>>('/teams/discover'),

  getTeamById: (teamId: string) =>
    apiClient.get<ApiResponse<Team>>(`/teams/${teamId}`),

  joinTeam: (teamId: string) =>
    apiClient.post<ApiResponse<void>>(`/teams/${teamId}/join`),

  leaveTeam: (teamId: string) =>
    apiClient.delete<ApiResponse<void>>(`/teams/${teamId}/leave`),

  getTeamMembers: (teamId: string) =>
    apiClient.get<ApiResponse<TeamMember[]>>(`/teams/${teamId}/members`),

  getTeamChannels: (teamId: string) =>
    apiClient.get<ApiResponse<import('../types').Channel[]>>(`/teams/${teamId}/channels`),
}
