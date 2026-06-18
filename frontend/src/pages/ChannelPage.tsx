import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Typography, CircularProgress, Chip, IconButton, Tooltip, Divider, Avatar, AvatarGroup,
} from '@mui/material'
import TagIcon from '@mui/icons-material/Tag'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import PeopleIcon from '@mui/icons-material/People'
import SearchIcon from '@mui/icons-material/Search'
import PhoneIcon from '@mui/icons-material/Phone'
import VideocamIcon from '@mui/icons-material/Videocam'
import CallModal from '../components/CallModal'
import { channelService } from '../services/channelService'
import { messageService } from '../services/messageService'
import { teamService } from '../services/teamService'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuthStore } from '../store/authStore'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import type { Channel, Message, TypingEvent, ReactionSummary, TeamMember } from '../types'

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>()
  const { user } = useAuthStore()

  const [channel, setChannel] = useState<Channel | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const [callOpen, setCallOpen] = useState(false)
  const [callVideoOff, setCallVideoOff] = useState(false)

  const shownIds = useRef<Set<string>>(new Set())
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (channelId) {
      shownIds.current.clear()
      setMessages([])
      setChannel(null)
      loadChannel(channelId)
      loadMessages(channelId)
    }
  }, [channelId])

  const loadChannel = async (id: string) => {
    try {
      const res = await channelService.getChannelById(id)
      setChannel(res.data.data)
      // Load team members
      try {
        const membersRes = await teamService.getTeamMembers(res.data.data.teamId)
        setMembers(membersRes.data.data)
      } catch { /* ignore */ }
    } catch { /* handled globally */ }
  }

  const loadMessages = async (id: string) => {
    setLoading(true)
    try {
      const res = await messageService.getMessages(id)
      const msgs = res.data.data
      msgs.forEach((m) => shownIds.current.add(m.id))
      setMessages(msgs)
    } finally {
      setLoading(false)
    }
  }

  const handleIncomingMessage = useCallback((message: Message) => {
    if (!shownIds.current.has(message.id)) {
      shownIds.current.add(message.id)
      setMessages((prev) => [...prev, message])
    }
    setConnected(true)
  }, [])

  const handleTypingEvent = useCallback((event: TypingEvent) => {
    if (event.userId === user?.id) return
    setTypingUsers((prev) => new Map(prev).set(event.userId, event.firstName))
    const prev = typingTimers.current.get(event.userId)
    if (prev) clearTimeout(prev)
    const timer = setTimeout(() => {
      setTypingUsers((m) => { const n = new Map(m); n.delete(event.userId); return n })
    }, 3000)
    typingTimers.current.set(event.userId, timer)
  }, [user?.id])

  const handleChannelEvent = useCallback((event: { type: string; payload: unknown }) => {
    if (event.type === 'MESSAGE_EDITED') {
      const edited = event.payload as Message
      setMessages((prev) => prev.map((m) => m.id === edited.id ? edited : m))
    } else if (event.type === 'MESSAGE_DELETED') {
      const { messageId } = event.payload as { messageId: string }
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } else if (event.type === 'REACTION_UPDATED') {
      const { messageId, reactions } = event.payload as { messageId: string; reactions: ReactionSummary[] }
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions } : m))
    }
  }, [])

  const { sendTyping } = useWebSocket({
    channelId,
    onMessage: handleIncomingMessage,
    onTyping: handleTypingEvent,
    onChannelEvent: handleChannelEvent,
    onConnect: () => setConnected(true),
  })

  const handleSend = async (content: string) => {
    if (!channelId) return
    const res = await messageService.sendMessage({ channelId, content })
    const sent = res.data.data
    if (!shownIds.current.has(sent.id)) {
      shownIds.current.add(sent.id)
      setMessages((prev) => [...prev, sent])
    }
  }

  const handleTypingChange = useCallback((isTyping: boolean) => {
    if (!channelId || !user) return
    if (isTyping) sendTyping({ userId: user.id, firstName: user.firstName, channelId })
  }, [channelId, user, sendTyping])

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      const res = await messageService.editMessage(messageId, content)
      setMessages((prev) => prev.map((m) => m.id === res.data.data.id ? res.data.data : m))
    } catch { /* ignore */ }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch { /* ignore */ }
  }

  const handleReaction = async (messageId: string, emoji: string, hasReacted: boolean) => {
    try {
      const res = hasReacted
        ? await messageService.removeReaction(messageId, emoji)
        : await messageService.addReaction(messageId, emoji)
      const reactions = res.data.data
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions } : m))
    } catch { /* ignore */ }
  }

  const typingText = Array.from(typingUsers.values()).join(', ')

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Channel Header */}
      <Box
        sx={{
          px: 3, py: 0,
          minHeight: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(205,214,244,0.08)',
          bgcolor: '#1E1E2E',
        }}
      >
        <TagIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
          {channel?.name ?? 'Channel'}
        </Typography>

        {channel?.description && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: 'rgba(255,255,255,0.15)', height: 20, alignSelf: 'center' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }} noWrap>
              {channel.description}
            </Typography>
          </>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Member avatars */}
        {members.length > 0 && (
          <Tooltip title={`${members.length} members`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'default' }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.65rem', border: '1.5px solid #1E1E2E' } }}>
                {members.map((m) => (
                  <Avatar key={m.userId} sx={{ bgcolor: 'primary.dark' }}>
                    {m.firstName.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary">{members.length}</Typography>
            </Box>
          </Tooltip>
        )}

        <Tooltip title="Voice call">
          <IconButton
            size="small"
            onClick={() => { setCallVideoOff(true); setCallOpen(true) }}
            sx={{ color: 'text.secondary', '&:hover': { color: '#22c55e', bgcolor: 'rgba(34,197,94,0.1)' } }}
          >
            <PhoneIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Video call">
          <IconButton
            size="small"
            onClick={() => { setCallVideoOff(false); setCallOpen(true) }}
            sx={{ color: 'text.secondary', '&:hover': { color: '#6264A7', bgcolor: 'rgba(98,100,167,0.15)' } }}
          >
            <VideocamIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Search in channel">
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <SearchIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Chip
          icon={<FiberManualRecordIcon sx={{ fontSize: '9px !important' }} />}
          label={connected ? 'Live' : 'Connecting…'}
          size="small"
          color={connected ? 'success' : 'default'}
          variant="outlined"
          sx={{ height: 22, fontSize: '0.7rem', borderRadius: 1 }}
        />
      </Box>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={user?.id}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onReaction={handleReaction}
      />

      {/* Typing indicator */}
      <Box sx={{ px: 3, minHeight: 20, mb: 0.5 }}>
        {typingText && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
            {typingText} {typingUsers.size === 1 ? 'is' : 'are'} typing…
          </Typography>
        )}
      </Box>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTypingChange={handleTypingChange}
        placeholder={`Message #${channel?.name ?? '…'}`}
      />

      {/* Call Modal */}
      <CallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        roomName={`teams-clone-channel-${channelId}`}
        displayName={`${user?.firstName} ${user?.lastName}`}
        videoOff={callVideoOff}
        title={`#${channel?.name ?? 'channel'}`}
      />
    </Box>
  )
}
