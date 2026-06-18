import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
  Button,
  Tabs,
  Tab,
} from '@mui/material'
import TagIcon from '@mui/icons-material/Tag'
import PeopleIcon from '@mui/icons-material/People'
import { teamService } from '../services/teamService'
import { useAuthStore } from '../store/authStore'
import type { Team, Channel, TeamMember } from '../types'

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [team, setTeam] = useState<Team | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (teamId) loadTeamData(teamId)
  }, [teamId])

  const loadTeamData = async (id: string) => {
    setLoading(true)
    try {
      const [teamRes, channelsRes, membersRes] = await Promise.all([
        teamService.getTeamById(id),
        teamService.getTeamChannels(id),
        teamService.getTeamMembers(id),
      ])
      setTeam(teamRes.data.data)
      setChannels(channelsRes.data.data)
      setMembers(membersRes.data.data)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!teamId) return
    try {
      await teamService.leaveTeam(teamId)
      navigate('/dashboard')
    } catch {
      // error displayed globally
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!team) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Team not found.</Typography>
      </Box>
    )
  }

  const isOwner = team.ownerId === user?.id

  return (
    <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
      {/* Team Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {team.name}
          </Typography>
          {team.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {team.description}
            </Typography>
          )}
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip label={`${members.length} members`} size="small" icon={<PeopleIcon />} />
            <Chip label={`${channels.length} channels`} size="small" icon={<TagIcon />} />
          </Box>
        </Box>
        {!isOwner && (
          <Button variant="outlined" color="error" size="small" onClick={handleLeaveTeam}>
            Leave Team
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Channels" icon={<TagIcon />} iconPosition="start" />
        <Tab label="Members" icon={<PeopleIcon />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <List>
          {channels.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              No channels yet. Create one from the sidebar.
            </Typography>
          ) : (
            channels.map((channel) => (
              <ListItem key={channel.id} disablePadding>
                <ListItemButton
                  onClick={() => navigate(`/channel/${channel.id}`)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <TagIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 18 }} />
                  <ListItemText
                    primary={channel.name}
                    secondary={channel.description}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      )}

      {tab === 1 && (
        <List>
          {members.map((member) => (
            <ListItem key={member.userId}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 36, height: 36 }}>
                {member.firstName.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={`${member.firstName} ${member.lastName}`}
                secondary={member.email}
              />
              <Chip
                label={member.role}
                size="small"
                color={member.role === 'OWNER' ? 'primary' : 'default'}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
