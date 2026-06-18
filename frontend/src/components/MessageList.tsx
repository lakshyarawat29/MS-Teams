import { useEffect, useRef, useState } from 'react'
import {
  Box, Typography, Avatar, Chip, IconButton, Menu, MenuItem,
  Tooltip, Divider,
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import type { Message } from '../types'

const QUICK_EMOJIS = ['ðŸ‘', 'â¤ï¸', 'ðŸ˜‚', 'ðŸ˜®', 'ðŸ˜¢', 'ðŸŽ‰', 'ðŸ”¥', 'âœ…']

interface MessageListProps {
  messages: Message[]
  currentUserId?: string
  onEditMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: string, hasReacted: boolean) => void
}

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

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(url)
}

function FileAttachmentPreview({ url }: { url: string }) {
  const isImage = isImageUrl(url)
  const filename = url.split('/').pop() ?? 'attachment'

  if (isImage) {
    return (
      <Box
        component="img"
        src={url}
        alt={filename}
        sx={{
          maxWidth: 360, maxHeight: 280, borderRadius: 1.5, mt: 0.75,
          display: 'block', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={() => window.open(url, '_blank')}
      />
    )
  }

  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1, mt: 0.75,
        px: 1.5, py: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
        color: 'text.primary', fontSize: '0.85rem',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
        maxWidth: 320,
      }}
    >
      <InsertDriveFileIcon sx={{ color: 'primary.main', fontSize: 20 }} />
      <Typography variant="body2" noWrap>{filename}</Typography>
    </Box>
  )
}

function MessageRow({
  message,
  isOwn,
  showHeader,
  currentUserId,
  onEdit,
  onDelete,
  onReaction,
}: {
  message: Message
  isOwn: boolean
  showHeader: boolean
  currentUserId?: string
  onEdit?: (id: string, content: string) => void
  onDelete?: (id: string) => void
  onReaction?: (id: string, emoji: string, hasReacted: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const saveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim())
    }
    setEditing(false)
  }

  // Detect if content is a file URL
  const isFileMessage = message.content.startsWith('/api/v1/files/')

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2,
        py: showHeader ? 1 : 0.25,
        position: 'relative',
        bgcolor: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        transition: 'background 0.1s',
        '&:hover .msg-actions': { opacity: 1 },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar or spacer */}
      <Box sx={{ width: 36, flexShrink: 0 }}>
        {showHeader ? (
          <Avatar sx={{ width: 36, height: 36, bgcolor: isOwn ? 'primary.dark' : '#5C5B5B', fontSize: '0.82rem' }}>
            {message.senderFirstName.charAt(0).toUpperCase()}
          </Avatar>
        ) : null}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {showHeader && (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.25 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: isOwn ? 'primary.light' : 'text.primary', fontSize: '0.88rem' }}>
              {message.senderFirstName} {message.senderLastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
              {formatTime(message.createdAt)}
            </Typography>
            {message.edited && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                (edited)
              </Typography>
            )}
          </Box>
        )}

        {editing ? (
          <Box>
            <Box
              component="textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() }
                if (e.key === 'Escape') setEditing(false)
              }}
              autoFocus
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 6,
                background: 'rgba(255,255,255,0.08)', color: '#F5F5F5',
                border: '1px solid rgba(98,100,167,0.6)', resize: 'vertical',
                fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5,
                outline: 'none', minHeight: 60,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Esc to cancel Â· Enter to save
            </Typography>
          </Box>
        ) : isFileMessage ? (
          <FileAttachmentPreview url={message.content} />
        ) : (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              lineHeight: 1.55, color: 'text.primary', fontSize: '0.9rem',
            }}
          >
            {message.content}
          </Typography>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {message.reactions.map((r) => {
              const hasReacted = currentUserId ? r.userIds.includes(currentUserId) : false
              return (
                <Chip
                  key={r.emoji}
                  label={`${r.emoji} ${r.count}`}
                  size="small"
                  onClick={() => onReaction?.(message.id, r.emoji, hasReacted)}
                  sx={{
                    height: 22, fontSize: '0.78rem', cursor: 'pointer', borderRadius: 3,
                    bgcolor: hasReacted ? 'rgba(98,100,167,0.25)' : 'rgba(255,255,255,0.07)',
                    border: hasReacted ? '1px solid rgba(98,100,167,0.7)' : '1px solid rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: hasReacted ? 'rgba(98,100,167,0.35)' : 'rgba(255,255,255,0.12)' },
                  }}
                />
              )
            })}
          </Box>
        )}
      </Box>

      {/* Hover action bar */}
      <Box
        className="msg-actions"
        sx={{
          position: 'absolute', right: 16, top: -16,
          display: 'flex', gap: 0.25,
          bgcolor: '#2D2C2C',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 1.5, px: 0.5, py: 0.25,
          opacity: 0, transition: 'opacity 0.15s',
          zIndex: 10,
        }}
      >
        <Tooltip title="React">
          <IconButton size="small" onClick={(e) => setEmojiAnchor(e.currentTarget)} sx={{ color: 'text.secondary' }}>
            <AddReactionIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        {isOwn && (
          <>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setEditing(true)} sx={{ color: 'text.secondary' }}>
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete?.(message.id)} sx={{ color: 'text.secondary' }}>
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="More">
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: 'text.secondary' }}>
            <MoreHorizIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Emoji picker */}
      <Menu anchorEl={emojiAnchor} open={Boolean(emojiAnchor)} onClose={() => setEmojiAnchor(null)}
        PaperProps={{ sx: { bgcolor: '#2D2C2C' } }}>
        <Box sx={{ display: 'flex', gap: 0.25, px: 0.75, py: 0.5 }}>
          {QUICK_EMOJIS.map((emoji) => {
            const existing = message.reactions?.find((r) => r.emoji === emoji)
            const hasReacted = currentUserId ? existing?.userIds.includes(currentUserId) ?? false : false
            return (
              <Tooltip key={emoji} title={emoji}>
                <IconButton size="small" onClick={() => {
                  onReaction?.(message.id, emoji, hasReacted)
                  setEmojiAnchor(null)
                }}>
                  <Typography fontSize={18}>{emoji}</Typography>
                </IconButton>
              </Tooltip>
            )
          })}
        </Box>
      </Menu>

      {/* More menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { bgcolor: '#2D2C2C', minWidth: 160 } }}>
        <MenuItem dense onClick={() => {
          navigator.clipboard.writeText(message.content)
          setMenuAnchor(null)
        }}>
          Copy text
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default function MessageList({
  messages,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  onReaction,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group consecutive messages from same sender (within 5 min)
  const grouped = messages.reduce<{ showHeader: boolean; msg: Message }[]>((acc, msg, i) => {
    const prev = messages[i - 1]
    const sameAuthor = prev?.senderId === msg.senderId
    const closeInTime = prev
      ? Math.abs(new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime()) < 5 * 60 * 1000
      : false
    acc.push({ showHeader: !sameAuthor || !closeInTime, msg })
    return acc
  }, [])

  // Group by date
  const byDate: { date: string; items: typeof grouped }[] = []
  grouped.forEach(({ showHeader, msg }) => {
    const dateLabel = formatDate(msg.createdAt)
    const last = byDate[byDate.length - 1]
    if (!last || last.date !== dateLabel) {
      byDate.push({ date: dateLabel, items: [{ showHeader: true, msg }] })
    } else {
      last.items.push({ showHeader, msg })
    }
  })

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
      {byDate.map(({ date, items }) => (
        <Box key={date}>
          {/* Date separator */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
            <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="caption" color="text.secondary"
              sx={{ px: 2, py: 0.25, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: '0.72rem' }}>
              {date}
            </Typography>
            <Divider sx={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          </Box>

          {items.map(({ showHeader, msg }) => (
            <MessageRow
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              showHeader={showHeader}
              currentUserId={currentUserId}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onReaction={onReaction}
            />
          ))}
        </Box>
      ))}
      <div ref={bottomRef} />
    </Box>
  )
}

