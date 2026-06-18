import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  Button, CircularProgress, Chip, Avatar, Divider,
} from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import ExploreIcon from '@mui/icons-material/Explore'
import AddIcon from '@mui/icons-material/Add'
import { teamService } from '../services/teamService'
import { useAuthStore } from '../store/authStore'
import type { Team } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [myRes, allRes] = await Promise.all([
        teamService.getMyTeams(),
        teamService.getAllTeams(),
      ])
      setMyTeams(myRes.data.data)
      setAllTeams(allRes.data.data)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (teamId: string) => {
    try {
      await teamService.joinTeam(teamId)
      loadData()
    } catch { /* already member */ }
  }

  const isMyTeam = (teamId: string) => myTeams.some((t) => t.id === teamId)

  const teamColor = (name: string) => {
    const colors = ['#6264A7', '#4B8A4E', '#C25E5E', '#B5632A', '#2E7DB5', '#7B4EA6']
    return colors[name.charCodeAt(0) % colors.length]
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <CircularProgress />
      </Box>
    )
  }

  const discoverTeams = allTeams.filter((t) => !isMyTeam(t.id))

  return (
    <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
      {/* Welcome */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          Good day, {user?.firstName}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's what's happening in your workspace today.
        </Typography>
      </Box>

      {/* My Teams */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <GroupsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>Your Teams</Typography>
          <Chip label={myTeams.length} size="small" sx={{ height: 20, fontSize: '0.72rem' }} />
        </Box>

        {myTeams.length === 0 ? (
          <Box sx={{
            p: 4, border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
          }}>
            <GroupsIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography color="text.secondary" variant="body2">
              You haven't joined any teams yet
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {myTeams.map((team) => (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card sx={{ bgcolor: '#252535', border: '1px solid rgba(205,214,244,0.08)', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 20px rgba(124,127,212,0.15)' }, transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                  <CardActionArea onClick={() => navigate(`/team/${team.id}`)}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: teamColor(team.name), borderRadius: 1.5, fontSize: '1rem', fontWeight: 700 }}>
                          {team.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} noWrap>{team.name}</Typography>
                          {team.description && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {team.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Discover */}
      {discoverTeams.length > 0 && (
        <Box>
          <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.08)' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ExploreIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600}>Discover Teams</Typography>
          </Box>
          <Grid container spacing={2}>
            {discoverTeams.map((team) => (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card sx={{ bgcolor: '#252535', border: '1px solid rgba(205,214,244,0.08)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: teamColor(team.name), borderRadius: 1.5, fontSize: '0.9rem' }}>
                        {team.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>{team.name}</Typography>
                      </Box>
                    </Box>
                    {team.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }} noWrap>
                        {team.description}
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleJoin(team.id)}
                      fullWidth
                      sx={{ borderRadius: 1 }}
                    >
                      Join
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}
