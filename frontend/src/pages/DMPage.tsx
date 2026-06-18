import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Avatar, CircularProgress, Divider, Badge } from '@mui/material'
import { dmService } from '../services/dmService'
import { useDMWebSocket } from '../hooks/useRealtime'
import { useAuthStore } from '../store/authStore'
import MessageInput from '../components/MessageInput'
import type { DirectMessage, Conversation, UserStatus } from '../types'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

function presenceColor(status?: string): string {
  switch (status as UserStatus) {
    case 'ONLINE': return '#22c55e'
    case 'AWAY': return '#eab308'
    case 'BUSY': return '#ef4444'
    default: return '#6b7280'
  }
}

export default function DMPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuthStore()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [typingText, setTypingText] = useState('')
  const shownIds = useRef<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      shownIds.current.clear()
      setMessages([])
      loadData(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadData = async (id: string) => {
    setLoading(true)
    try {
      const [convsRes, msgsRes] = await Promise.all([
        dmService.getConversations(),
        dmService.getMessages(id),
      ])
      const conv = convsRes.data.data.find((c) => c.id === id) ?? null
      setConversation(conv)
      const msgs = msgsRes.data.data
      msgs.forEach((m) => shownIds.current.add(m.id))
      setMessages(msgs)
    } finally {
      setLoading(false)
    }
  }

  const handleIncoming = useCallback((msg: DirectMessage) => {
    if (!shownIds.current.has(msg.id)) {
      shownIds.current.add(msg.id)
      setMessages((prev) => [...prev, msg])
    }
  }, [])

  useDMWebSocket({ conversationId, onMessage: handleIncoming })

  const handleSend = async (content: string) => {
    if (!conversationId || !conversation) return
    const res = await dmService.sendMessage(conversation.participantId, content)
    const sent = res.data.data
    if (!shownIds.current.has(sent.id)) {
      shownIds.current.add(sent.id)
      setMessages((prev) => [...prev, sent])
    }
  }

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  const otherName = conversation
    ? `${conversation.participantFirstName} ${conversation.participantLastName}`
    : 'Direct Message'

  // Group messages by date
  const byDate: { date: string; msgs: DirectMessage[] }[] = []
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.createdAt)
    const last = byDate[byDate.length - 1]
    if (!last || last.date !== dateLabel) byDate.push({ date: dateLabel, msgs: [msg] })
    else last.msgs.push(msg)
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{
        px: 3, minHeight: 52,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 1.5,
        bgcolor: '#292828',
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%',
              bgcolor: presenceColor(conversation?.participantStatus),
              border: '2px solid #292828',
            }} />
          }
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.dark', fontSize: '0.75rem' }}>
            {conversation?.participantFirstName?.charAt(0).toUpperCase() ?? '?'}
          </Avatar>
        </Badge>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem', lineHeight: 1.2 }}>
            {otherName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
            {conversation?.participantEmail}
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {byDate.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.dark', fontSize: '1.5rem' }}>
              {conversation?.participantFirstName?.charAt(0).toUpperCase() ?? '?'}
            </Avatar>
            <Typography color="text.secondary" variant="body2">
              This is the beginning of your conversation with {otherName}
            </Typography>
          </Box>
        ) : (
          byDate.map(({ date, msgs }) => (
            <Box key={date}>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
                <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="caption" color="text.secondary"
                  sx={{ px: 2, py: 0.25, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: '0.72rem' }}>
                  {date}
                </Typography>
                <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
              </Box>
              {msgs.map((msg) => {
                const isOwn = msg.senderId === user?.id
                return (
                  <Box key={msg.id} sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1.5,
                    px: 2, py: 0.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                  }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: isOwn ? 'primary.dark' : '#5C5B5B', fontSize: '0.82rem', flexShrink: 0 }}>
                      {msg.senderFirstName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.25 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.88rem', color: isOwn ? 'primary.light' : 'text.primary' }}>
                          {isOwn ? 'You' : msg.senderFirstName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                          {formatTime(msg.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.55, fontSize: '0.9rem' }}>
                        {msg.content}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          ))
        )}
        <div ref={bottomRef} />
      </Box>

      {typingText && (
        <Box sx={{ px: 3, mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>
            {typingText}
          </Typography>
        </Box>
      )}

      <MessageInput onSend={handleSend} placeholder={`Message ${otherName}`} />
    </Box>
  )
}
