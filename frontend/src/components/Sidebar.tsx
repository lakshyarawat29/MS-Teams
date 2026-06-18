import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, IconButton, Avatar, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Badge, Collapse,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import TagIcon from '@mui/icons-material/Tag'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PersonIcon from '@mui/icons-material/Person'
import NotificationBell from './NotificationBell'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { teamService } from '../services/teamService'
import { channelService } from '../services/channelService'
import { dmService } from '../services/dmService'
import type { Team, Channel, Conversation, UserStatus } from '../types'

const SIDEBAR_WIDTH = 256

function presenceColor(status?: UserStatus): string {
  switch (status) {
    case 'ONLINE': return '#22c55e'
    case 'AWAY': return '#eab308'
    case 'BUSY': return '#ef4444'
    default: return '#6b7280'
  }
}

// â”€â”€â”€ Teams Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TeamsPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const [teams, setTeams] = useState<Team[]>([])
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [channelMap, setChannelMap] = useState<Record<string, Channel[]>>({})
  const [loading, setLoading] = useState(true)

  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [createChannelTeam, setCreateChannelTeam] = useState<Team | null>(null)
  const [teamName, setTeamName] = useState('')
  const [teamDesc, setTeamDesc] = useState('')
  const [channelName, setChannelName] = useState('')

  useEffect(() => { loadTeams() }, [])

  const loadTeams = async () => {
    setLoading(true)
    try {
      const res = await teamService.getMyTeams()
      const myTeams = res.data.data
      setTeams(myTeams)
      if (myTeams.length > 0) {
        const firstTeam = myTeams[0]
        setExpandedTeam(firstTeam.id)
        loadChannels(firstTeam.id)
      }
    } catch { /* handled globally */ } finally {
      setLoading(false)
    }
  }

  const loadChannels = async (teamId: string) => {
    try {
      const res = await teamService.getTeamChannels(teamId)
      setChannelMap((prev) => ({ ...prev, [teamId]: res.data.data }))
    } catch {
      setChannelMap((prev) => ({ ...prev, [teamId]: [] }))
    }
  }

  const toggleTeam = (teamId: string) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null)
    } else {
      setExpandedTeam(teamId)
      if (!channelMap[teamId]) loadChannels(teamId)
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    try {
      await teamService.createTeam({ name: teamName, description: teamDesc })
      setTeamName(''); setTeamDesc(''); setCreateTeamOpen(false)
      loadTeams()
    } catch { /* ignore */ }
  }

  const handleCreateChannel = async () => {
    if (!channelName.trim() || !createChannelTeam) return
    try {
      await channelService.createChannel({ teamId: createChannelTeam.id, name: channelName })
      setChannelName(''); setCreateChannelOpen(false)
      loadChannels(createChannelTeam.id)
    } catch { /* ignore */ }
  }

  return (
    <>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}
          sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
          Your Teams
        </Typography>
        <Tooltip title="New Team">
          <IconButton size="small" onClick={() => setCreateTeamOpen(true)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={18} />
        </Box>
      ) : (
        <List dense disablePadding>
          {teams.map((team) => {
            const isExpanded = expandedTeam === team.id
            const channels = channelMap[team.id] ?? []
            return (
              <Box key={team.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => { toggleTeam(team.id); navigate(`/team/${team.id}`) }}
                    sx={{ px: 1.5, py: 0.75, mx: 0.5, borderRadius: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {isExpanded
                        ? <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        : <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                    </ListItemIcon>
                    <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main', fontSize: '0.6rem', mr: 1 }}>
                      {team.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={team.name}
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>

                <Collapse in={isExpanded} timeout="auto">
                  {channels.length === 0 && (
                    <Typography variant="caption" color="text.disabled"
                      sx={{ pl: 6, pr: 2, pb: 0.5, display: 'block' }}>
                      No channels
                    </Typography>
                  )}
                  {channels.map((ch) => {
                    const active = location.pathname === `/channel/${ch.id}`
                    return (
                      <ListItem key={ch.id} disablePadding>
                        <ListItemButton
                          selected={active}
                          onClick={() => navigate(`/channel/${ch.id}`)}
                          sx={{ pl: 4.5, pr: 1.5, py: 0.5, mx: 0.5, borderRadius: 1 }}
                        >
                          <TagIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.75 }} />
                          <ListItemText
                            primary={ch.name}
                            primaryTypographyProps={{ fontSize: '0.82rem' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )
                  })}
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => { setCreateChannelTeam(team); setCreateChannelOpen(true) }}
                      sx={{ pl: 4.5, pr: 1.5, py: 0.5, mx: 0.5, borderRadius: 1 }}
                    >
                      <AddIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.75 }} />
                      <ListItemText
                        primary="Add channel"
                        primaryTypographyProps={{ fontSize: '0.82rem', color: 'text.secondary' }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Collapse>
              </Box>
            )
          })}
        </List>
      )}

      {/* Create Team Dialog */}
      <Dialog open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create a team</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Team name" value={teamName}
            onChange={(e) => setTeamName(e.target.value)} margin="normal" />
          <TextField fullWidth label="Description (optional)" value={teamDesc}
            onChange={(e) => setTeamDesc(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTeamOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained" disabled={!teamName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Channel Dialog */}
      <Dialog open={createChannelOpen} onClose={() => setCreateChannelOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add a channel to {createChannelTeam?.name}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Channel name" value={channelName}
            onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            margin="normal" helperText="lowercase, hyphens only (e.g. general, dev-chat)" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateChannelOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateChannel} variant="contained" disabled={!channelName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// â”€â”€â”€ Chat Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChatPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadConversations() }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const res = await dmService.getConversations()
      setConversations(res.data.data)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}
          sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
          Direct Messages
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={18} />
        </Box>
      ) : (
        <List dense disablePadding>
          {conversations.map((conv) => {
            const active = location.pathname === `/dm/${conv.id}`
            return (
              <ListItem key={conv.id} disablePadding>
                <ListItemButton
                  selected={active}
                  onClick={() => navigate(`/dm/${conv.id}`)}
                  sx={{ px: 1.5, py: 0.75, mx: 0.5, borderRadius: 1 }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: presenceColor(conv.participantStatus as UserStatus),
                        border: '1.5px solid #1F1F1F',
                      }} />
                    }
                    sx={{ mr: 1.5 }}
                  >
                    <Avatar sx={{ width: 26, height: 26, bgcolor: 'secondary.dark', fontSize: '0.72rem' }}>
                      {conv.participantFirstName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                  <ListItemText
                    primary={`${conv.participantFirstName} ${conv.participantLastName}`}
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
          {conversations.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ px: 2, display: 'block' }}>
              No direct messages yet
            </Typography>
          )}
        </List>
      )}
    </>
  )
}

// â”€â”€â”€ Root Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Sidebar() {
  const { user } = useAuthStore()
  const { activeSection } = useUIStore()
  const navigate = useNavigate()

  const sectionTitle = {
    teams: 'Teams',
    chat: 'Chat',
    calendar: 'Calendar',
    search: 'Search',
  }[activeSection]

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: '#181825',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: '1px solid rgba(205,214,244,0.06)',
      }}
    >
      {/* Section header */}
      <Box sx={{
        px: 2, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(205,214,244,0.06)',
        minHeight: 52,
      }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
          {sectionTitle}
        </Typography>
        <NotificationBell />
      </Box>

      {/* Section content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {activeSection === 'teams' && <TeamsPanel />}
        {activeSection === 'chat' && <ChatPanel />}
        {activeSection === 'calendar' && (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              View your upcoming meetings in the calendar.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer: user info */}
      <Divider sx={{ borderColor: 'rgba(205,214,244,0.06)' }} />
      <Box sx={{
        p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
        cursor: 'pointer', '&:hover': { bgcolor: 'rgba(205,214,244,0.04)' },
        transition: 'background 0.15s',
      }}
        onClick={() => navigate('/profile')}
      >
        <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
          {user?.firstName?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.82rem' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Edit profile">
          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Tooltip>
      </Box>
    </Box>
  )
}

