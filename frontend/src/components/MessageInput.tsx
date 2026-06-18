import { useState, useRef, type KeyboardEvent } from 'react'
import { Box, IconButton, Tooltip, CircularProgress, Typography, LinearProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import GifBoxIcon from '@mui/icons-material/GifBox'
import apiClient from '../services/apiClient'

const QUICK_EMOJIS = ['ðŸ˜€', 'ðŸ‘', 'â¤ï¸', 'ðŸ˜‚', 'ðŸŽ‰', 'ðŸ”¥', 'ðŸ’¯', 'ðŸ˜¢', 'ðŸ˜®', 'âœ…']

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onTypingChange?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({ onSend, onTypingChange, disabled, placeholder }: MessageInputProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showEmoji, setShowEmoji] = useState(false)

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed || sending || uploading) return
    setSending(true)
    try {
      await onSend(trimmed)
      setValue('')
      onTypingChange?.(false)
      if (typingTimer.current) clearTimeout(typingTimer.current)
    } finally {
      setSending(false)
    }
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
    if (newValue.trim()) {
      onTypingChange?.(true)
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => onTypingChange?.(false), 2000)
    } else {
      onTypingChange?.(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    setUploadProgress(0)
    try {
      const res = await apiClient.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      const fileUrl: string = res.data.data.url
      // Send a message with just the file URL â€” MessageList renders it specially
      await onSend(fileUrl)
    } catch { /* ignore */ } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const insertFormat = (before: string, after: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end)
    handleChange(newVal)
    setTimeout(() => {
      el.selectionStart = start + before.length
      el.selectionEnd = end + before.length
      el.focus()
    }, 0)
  }

  return (
    <Box
      sx={{
        mx: 2, mb: 2,
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 2,
        bgcolor: '#3B3A3A',
        overflow: 'hidden',
        '&:focus-within': { borderColor: 'rgba(98,100,167,0.7)', boxShadow: '0 0 0 1px rgba(98,100,167,0.3)' },
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Upload progress */}
      {uploading && (
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{ height: 2, borderRadius: 0 }}
        />
      )}

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, pt: 0.75, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Tooltip title="Bold (wrap selection)">
          <IconButton size="small" tabIndex={-1} onClick={() => insertFormat('**', '**')}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <FormatBoldIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic (wrap selection)">
          <IconButton size="small" tabIndex={-1} onClick={() => insertFormat('_', '_')}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <FormatItalicIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.12)', mx: 0.5 }} />
        <Tooltip title="Attach file">
          <IconButton size="small" tabIndex={-1} onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            {uploading ? <CircularProgress size={14} /> : <AttachFileIcon sx={{ fontSize: 17 }} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Emoji">
          <IconButton size="small" tabIndex={-1} onClick={() => setShowEmoji((v) => !v)}
            sx={{ color: showEmoji ? 'primary.light' : 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <EmojiEmotionsIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Emoji row */}
      {showEmoji && (
        <Box sx={{ display: 'flex', gap: 0.5, px: 1.5, py: 0.75, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          {QUICK_EMOJIS.map((e) => (
            <Box
              key={e}
              onClick={() => { handleChange(value + e); setShowEmoji(false) }}
              sx={{ cursor: 'pointer', fontSize: 20, borderRadius: 1, px: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              {e}
            </Box>
          ))}
        </Box>
      )}

      {/* Text area + send */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', px: 1, py: 0.75 }}>
        <Box
          component="textarea"
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending || uploading}
          placeholder={placeholder || 'Type a messageâ€¦'}
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#F5F5F5', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5,
            resize: 'none', padding: '4px 6px', minHeight: 32, maxHeight: 160,
            overflowY: 'auto',
          }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 160) + 'px'
          }}
        />
        <Tooltip title="Send (Enter)">
          <span>
            <IconButton
              size="small"
              color="primary"
              onClick={handleSend}
              disabled={!value.trim() || sending || disabled || uploading}
              sx={{
                bgcolor: value.trim() ? 'primary.main' : 'transparent',
                color: value.trim() ? '#fff' : 'text.disabled',
                width: 32, height: 32,
                '&:hover': { bgcolor: value.trim() ? 'primary.dark' : 'transparent' },
                transition: 'all 0.15s',
              }}
            >
              {sending ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.csv,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
          e.target.value = ''
        }}
      />
    </Box>
  )
}
