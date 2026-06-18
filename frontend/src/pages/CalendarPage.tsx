import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, Avatar, Chip, IconButton, Tooltip, Divider,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PeopleIcon from '@mui/icons-material/People'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { meetingService } from '../services/meetingService'
import { useAuthStore } from '../store/authStore'
import type { Meeting } from '../types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const hours = Math.floor(ms / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function isUpcoming(meeting: Meeting) {
  return new Date(meeting.endTime) > new Date()
}

export default function CalendarPage() {
  const { user } = useAuthStore()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadMeetings() }, [])

  const loadMeetings = async () => {
    setLoading(true)
    try {
      const res = await meetingService.getUpcoming()
      setMeetings(res.data.data)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim() || !startTime || !endTime) return
    setSaving(true)
    try {
      await meetingService.createMeeting({
        title,
        description: description || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      })
      setTitle(''); setDescription(''); setStartTime(''); setEndTime('')
      setCreateOpen(false)
      loadMeetings()
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await meetingService.deleteMeeting(id)
      setMeetings((prev) => prev.filter((m) => m.id !== id))
    } catch { /* ignore */ }
  }

  // Pre-fill start time to next hour
  const openCreate = () => {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1)
    const end = new Date(now.getTime() + 3600000)
    const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setStartTime(toLocal(now))
    setEndTime(toLocal(end))
    setCreateOpen(true)
  }

  const upcoming = meetings.filter(isUpcoming)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#292828' }}>
      {/* Header */}
      <Box sx={{
        px: 3, py: 1.5, minHeight: 52,
        display: 'flex', alignItems: 'center', gap: 2,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        bgcolor: '#292828',
      }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
          Meetings
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 1, textTransform: 'none', fontSize: '0.82rem' }}
        >
          New meeting
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress />
          </Box>
        ) : upcoming.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 2 }}>
            <VideoCallIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography color="text.secondary" variant="body1">No upcoming meetings</Typography>
            <Typography color="text.disabled" variant="body2">Schedule a meeting to collaborate with your team</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
              Schedule a meeting
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 1.5, display: 'block' }}>
              Upcoming — {upcoming.length} meeting{upcoming.length !== 1 ? 's' : ''}
            </Typography>
            <List disablePadding>
              {upcoming.map((meeting, i) => (
                <Box key={meeting.id}>
                  {i > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />}
                  <Box sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: '#252525', border: '1px solid rgba(255,255,255,0.07)',
                    '&:hover': { borderColor: 'rgba(98,100,167,0.4)' },
                    transition: 'border-color 0.15s',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{
                        width: 44, height: 44, borderRadius: 2,
                        bgcolor: 'rgba(98,100,167,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <VideoCallIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                          {meeting.title}
                        </Typography>
                        {meeting.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                            {meeting.description}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(meeting.startTime)} · {formatDuration(meeting.startTime, meeting.endTime)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Participants */}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                          {meeting.participants.map((p) => (
                            <Chip
                              key={p.userId}
                              avatar={<Avatar sx={{ bgcolor: 'primary.dark', fontSize: '0.6rem' }}>{p.firstName.charAt(0)}</Avatar>}
                              label={`${p.firstName} ${p.lastName}`}
                              size="small"
                              sx={{ height: 22, fontSize: '0.72rem', bgcolor: 'rgba(255,255,255,0.06)' }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VideoCallIcon />}
                          sx={{ fontSize: '0.78rem', borderRadius: 1, textTransform: 'none' }}
                        >
                          Join
                        </Button>
                        {meeting.organizerId === user?.id && (
                          <Tooltip title="Cancel meeting">
                            <IconButton size="small" onClick={() => handleDelete(meeting.id)}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </List>
          </Box>
        )}
      </Box>

      {/* Create Meeting Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Schedule a meeting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField
            autoFocus fullWidth label="Meeting title" value={title}
            onChange={(e) => setTitle(e.target.value)} required
          />
          <TextField
            fullWidth label="Description (optional)" value={description}
            onChange={(e) => setDescription(e.target.value)} multiline rows={2}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth label="Start time" type="datetime-local" value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }} required
            />
            <TextField
              fullWidth label="End time" type="datetime-local" value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }} required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!title.trim() || !startTime || !endTime || saving}
          >
            {saving ? <CircularProgress size={18} /> : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
