import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, InputBase, Avatar, List, ListItem, ListItemButton,
  ListItemText, ListItemAvatar, CircularProgress, Chip, Divider, Tabs, Tab,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TagIcon from '@mui/icons-material/Tag'
import PersonIcon from '@mui/icons-material/Person'
import MessageIcon from '@mui/icons-material/Message'
import { searchService } from '../services/searchService'

type TabValue = 'all' | 'messages' | 'channels' | 'users'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TabValue>('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    messages: any[]
    channels: any[]
    users: any[]
  } | null>(null)

  const debounceTimer = useCallback(() => {
    let t: ReturnType<typeof setTimeout>
    return (fn: () => void, ms: number) => {
      clearTimeout(t)
      t = setTimeout(fn, ms)
    }
  }, [])()

  const handleSearch = (q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults(null); return }
    debounceTimer(async () => {
      setLoading(true)
      try {
        const res = await searchService.search(q, tab)
        setResults(res.data.data as any)
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }, 400)
  }

  const handleTabChange = async (_: unknown, newTab: TabValue) => {
    setTab(newTab)
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await searchService.search(query, newTab)
      setResults(res.data.data as any)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  const totalCount = results
    ? (results.messages?.length ?? 0) + (results.channels?.length ?? 0) + (results.users?.length ?? 0)
    : 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#292828' }}>
      {/* Search header */}
      <Box sx={{
        px: 3, py: 2,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        bgcolor: '#201F1F',
      }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          bgcolor: '#3B3A3A',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 2, px: 2, py: 1,
          maxWidth: 640,
          '&:focus-within': { borderColor: 'rgba(98,100,167,0.7)' },
          transition: 'border-color 0.15s',
        }}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <InputBase
            autoFocus
            fullWidth
            placeholder="Search messages, channels, people…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ fontSize: '0.9rem', color: 'text.primary' }}
          />
          {loading && <CircularProgress size={16} />}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: '#201F1F' }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: '0.85rem' } }}
        >
          <Tab value="all" label="All" />
          <Tab value="messages" label={`Messages${results?.messages?.length ? ` (${results.messages.length})` : ''}`} />
          <Tab value="channels" label={`Channels${results?.channels?.length ? ` (${results.channels.length})` : ''}`} />
          <Tab value="users" label={`People${results?.users?.length ? ` (${results.users.length})` : ''}`} />
        </Tabs>
      </Box>

      {/* Results */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {!query.trim() ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 2 }}>
            <SearchIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
            <Typography color="text.secondary" variant="body1">
              Search for anything in your workspace
            </Typography>
            <Typography color="text.disabled" variant="body2">
              Messages, channels, and people
            </Typography>
          </Box>
        ) : results && totalCount === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 2 }}>
            <Typography color="text.secondary">No results for "{query}"</Typography>
          </Box>
        ) : results ? (
          <>
            {/* Messages */}
            {(tab === 'all' || tab === 'messages') && results.messages?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MessageIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Messages</Typography>
                </Box>
                <List dense disablePadding>
                  {results.messages.map((msg: any) => (
                    <ListItem key={msg.id} disablePadding>
                      <ListItemButton
                        onClick={() => navigate(`/channel/${msg.channelId}`)}
                        sx={{ borderRadius: 1, py: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.75rem' }}>
                            {msg.senderFirstName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                                {msg.senderFirstName} {msg.senderLastName}
                              </Typography>
                              <TagIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {msg.content}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                {tab === 'all' && results.channels?.length > 0 && (
                  <Divider sx={{ mt: 2, mb: 0.5, borderColor: 'rgba(255,255,255,0.08)' }} />
                )}
              </Box>
            )}

            {/* Channels */}
            {(tab === 'all' || tab === 'channels') && results.channels?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TagIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Channels</Typography>
                </Box>
                <List dense disablePadding>
                  {results.channels.map((ch: any) => (
                    <ListItem key={ch.id} disablePadding>
                      <ListItemButton
                        onClick={() => navigate(`/channel/${ch.id}`)}
                        sx={{ borderRadius: 1, py: 0.75 }}
                      >
                        <TagIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1.5 }} />
                        <ListItemText
                          primary={ch.name}
                          secondary={ch.description}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.78rem' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                {tab === 'all' && results.users?.length > 0 && (
                  <Divider sx={{ mt: 2, mb: 0.5, borderColor: 'rgba(255,255,255,0.08)' }} />
                )}
              </Box>
            )}

            {/* Users */}
            {(tab === 'all' || tab === 'users') && results.users?.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.7rem' }}>People</Typography>
                </Box>
                <List dense disablePadding>
                  {results.users.map((u: any) => (
                    <ListItem key={u.id} disablePadding>
                      <ListItemButton sx={{ borderRadius: 1, py: 0.75 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                            {u.firstName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${u.firstName} ${u.lastName}`}
                          secondary={u.email}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.78rem' }}
                        />
                        <Chip
                          label={u.status?.toLowerCase() ?? 'offline'}
                          size="small"
                          sx={{
                            height: 20, fontSize: '0.65rem', borderRadius: 1,
                            bgcolor: u.status === 'ONLINE' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)',
                            color: u.status === 'ONLINE' ? '#22c55e' : 'text.secondary',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        ) : null}
      </Box>
    </Box>
  )
}
