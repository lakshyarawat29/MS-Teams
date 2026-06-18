export type UserStatus = 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  bio?: string
  status: UserStatus
  lastSeen?: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: string
  email: string
  firstName: string
  lastName: string
}

export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
}

export interface TeamMember {
  userId: string
  firstName: string
  lastName: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
}

export interface Channel {
  id: string
  teamId: string
  name: string
  description?: string
  createdBy: string
  createdAt: string
}

export interface ReactionSummary {
  emoji: string
  count: number
  userIds: string[]
}

export interface Message {
  id: string
  channelId: string
  senderId: string
  senderFirstName: string
  senderLastName: string
  content: string
  edited: boolean
  editedAt?: string
  createdAt: string
  reactions: ReactionSummary[]
}

export interface Conversation {
  id: string
  participantId: string
  participantFirstName: string
  participantLastName: string
  participantEmail: string
  participantStatus: string
  createdAt: string
}

export interface DirectMessage {
  id: string
  conversationId: string
  senderId: string
  senderFirstName: string
  senderLastName: string
  content: string
  edited: boolean
  editedAt?: string
  createdAt: string
}

export type NotificationType = 'MESSAGE' | 'MENTION' | 'TEAM_INVITE' | 'REACTION' | 'DIRECT_MESSAGE'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body?: string
  read: boolean
  referenceId?: string
  createdAt: string
}

export interface TypingEvent {
  userId: string
  firstName: string
  channelId: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  errorCode?: string
  message?: string
  timestamp: string
}

export interface SearchResults {
  users: User[]
  channels: Channel[]
  messages: Message[]
}

export interface MeetingParticipant {
  userId: string
  firstName: string
  lastName: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  organizerId: string
  organizerName: string
  teamId?: string
  startTime: string
  endTime: string
  createdAt: string
  participants: MeetingParticipant[]
}

