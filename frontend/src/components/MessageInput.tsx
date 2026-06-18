import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Box, IconButton, Tooltip, CircularProgress, LinearProgress, Popover, Paper, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import CodeIcon from '@mui/icons-material/Code'
import apiClient from '../services/apiClient'
import EmojiPicker from './EmojiPicker'
import type { TeamMember } from '../types'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onTypingChange?: (isTyping: boolean) => void
  disabled?: boolean
  placeholder?: string
  members?: TeamMember[]
}

export default function MessageInput({ onSend, onTypingChange, disabled, placeholder, members = [] }: MessageInputProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null)

  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState<number>(0)
  const [mentionIndex, setMentionIndex] = useState(0)

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mentionMatches = mentionQuery !== null
    ? members.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        m.firstName.toLowerCase().startsWith(mentionQuery.toLowerCase())
      ).slice(0, 6)
    : []

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed || sending || uploading) return
    setSending(true)
    try {
      await onSend(trimmed)
      setValue('')
      setMentionQuery(null)
      onTypingChange?.(false)
      if (typingTimer.current) clearTimeout(typingTimer.current)
    } finally {
      setSending(false)
    }
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
    const cursor = textareaRef.current?.selectionStart ?? newValue.length
    const before = newValue.slice(0, cursor)
    const mentionMatch = before.match(/@(\w*)$/)
    if (mentionMatch && members.length > 0) {
      setMentionQuery(mentionMatch[1])
      setMentionStart(cursor - mentionMatch[0].length)
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
    }
    if (newValue.trim()) {
      onTypingChange?.(true)
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => onTypingChange?.(false), 2000)
    } else {
      onTypingChange?.(false)
    }
  }

  const insertMention = useCallback((member: TeamMember) => {
    const mention = `@${member.firstName} `
    const after = value.slice(mentionStart + 1 + (mentionQuery?.length ?? 0))
    const newVal = value.slice(0, mentionStart) + mention + after
    setValue(newVal)
    setMentionQuery(null)
    setTimeout(() => {
      textareaRef.current?.focus()
      const pos = mentionStart + mention.length
      textareaRef.current?.setSelectionRange(pos, pos)
    }, 0)
  }, [value, mentionStart, mentionQuery])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionMatches.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex((i) => Math.min(i + 1, mentionMatches.length - 1)); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex((i) => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionMatches[mentionIndex]); return }
      if (e.key === 'Escape') { setMentionQuery(null); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
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
        onUploadProgress: (e) => { if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100)) },
      })
      const fileUrl: string = res.data.data.url
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
    setTimeout(() => { el.selectionStart = start + before.length; el.selectionEnd = end + before.length; el.focus() }, 0)
  }

  const handleEmojiSelect = (emoji: string) => {
    const el = textareaRef.current
    const pos = el?.selectionStart ?? value.length
    const newVal = value.slice(0, pos) + emoji + value.slice(pos)
    handleChange(newVal)
    setEmojiAnchor(null)
    setTimeout(() => { el?.focus(); const p = pos + emoji.length; el?.setSelectionRange(p, p) }, 0)
  }

  return (
    <Box sx={{ mx: 2, mb: 2, position: 'relative' }}>
      {/* @mention dropdown */}
      {mentionQuery !== null && mentionMatches.length > 0 && (
        <Paper elevation={8} sx={{ position: 'absolute', bottom: '100%', left: 0, mb: 0.5, width: 240, bgcolor: '#252535', border: '1px solid rgba(205,214,244,0.14)', borderRadius: 1.5, overflow: 'hidden', zIndex: 1300 }}>
          <Typography variant="caption" sx={{ display: 'block', px: 1.5, pt: 0.75, pb: 0.25, color: 'text.secondary', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Mention
          </Typography>
          {mentionMatches.map((m, i) => (
            <Box key={m.userId} onMouseDown={(e) => { e.preventDefault(); insertMention(m) }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, cursor: 'pointer', bgcolor: i === mentionIndex ? 'rgba(124,127,212,0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(124,127,212,0.2)' }, transition: 'background 0.1s' }}>
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#6264A7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {m.firstName.charAt(0)}{m.lastName.charAt(0)}
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>{m.firstName} {m.lastName}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.7rem', textTransform: 'capitalize' }}>{m.role.toLowerCase()}</Typography>
            </Box>
          ))}
        </Paper>
      )}

      {/* Input box */}
      <Box sx={{ border: '1px solid rgba(205,214,244,0.12)', borderRadius: 2, bgcolor: '#252535', overflow: 'hidden', '&:focus-within': { borderColor: 'rgba(124,127,212,0.6)', boxShadow: '0 0 0 2px rgba(124,127,212,0.15)' }, transition: 'border-color 0.2s, box-shadow 0.2s' }}>
        {uploading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 2, borderRadius: 0 }} />}

        {/* Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, pt: 0.75, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Tooltip title="Bold"><IconButton size="small" tabIndex={-1} onClick={() => insertFormat('**', '**')} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}><FormatBoldIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
          <Tooltip title="Italic"><IconButton size="small" tabIndex={-1} onClick={() => insertFormat('_', '_')} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}><FormatItalicIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
          <Tooltip title="Inline code"><IconButton size="small" tabIndex={-1} onClick={() => insertFormat('`', '`')} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}><CodeIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
          <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.12)', mx: 0.5 }} />
          <Tooltip title="Attach file"><IconButton size="small" tabIndex={-1} onClick={() => fileInputRef.current?.click()} disabled={uploading} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>{uploading ? <CircularProgress size={14} /> : <AttachFileIcon sx={{ fontSize: 17 }} />}</IconButton></Tooltip>
          <Tooltip title="Emoji"><IconButton size="small" tabIndex={-1} onClick={(e) => setEmojiAnchor(e.currentTarget)} sx={{ color: Boolean(emojiAnchor) ? 'primary.light' : 'text.secondary', '&:hover': { color: 'text.primary' } }}><EmojiEmotionsIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
          {members.length > 0 && (
            <Tooltip title="Mention someone"><IconButton size="small" tabIndex={-1} onClick={() => { const el = textareaRef.current; if (!el) return; const pos = el.selectionStart; const nv = value.slice(0, pos) + '@' + value.slice(pos); handleChange(nv); setTimeout(() => { el.focus(); el.setSelectionRange(pos + 1, pos + 1) }, 0) }} sx={{ color: 'text.secondary', '&:hover': { color: '#7C7FD4' } }}><Typography sx={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1 }}>@</Typography></IconButton></Tooltip>
          )}
        </Box>

        {/* Text area + send */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', px: 1, py: 0.75 }}>
          <Box component="textarea" ref={textareaRef} value={value} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown} disabled={disabled || sending || uploading} placeholder={placeholder || 'Type a message… (@ to mention, **bold**, _italic_, `code`)'} rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#F5F5F5', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5, resize: 'none', padding: '4px 6px', minHeight: 32, maxHeight: 160, overflowY: 'auto' }}
            onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px' }} />
          <Tooltip title="Send (Enter)"><span>
            <IconButton size="small" color="primary" onClick={handleSend} disabled={!value.trim() || sending || disabled || uploading}
              sx={{ bgcolor: value.trim() ? 'primary.main' : 'transparent', color: value.trim() ? '#fff' : 'text.disabled', width: 32, height: 32, '&:hover': { bgcolor: value.trim() ? 'primary.dark' : 'transparent' }, transition: 'all 0.15s' }}>
              {sending ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </span></Tooltip>
        </Box>

        <input ref={fileInputRef} type="file" hidden accept="image/*,.pdf,.doc,.docx,.txt,.zip,.csv,.xlsx" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); e.target.value = '' }} />
      </Box>

      {/* Emoji picker popover */}
      <Popover open={Boolean(emojiAnchor)} anchorEl={emojiAnchor} onClose={() => setEmojiAnchor(null)} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }} PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'visible' } }}>
        <EmojiPicker onSelect={handleEmojiSelect} />
      </Popover>
    </Box>
  )
}
