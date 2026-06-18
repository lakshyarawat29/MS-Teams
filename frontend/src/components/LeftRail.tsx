import { useNavigate } from 'react-router-dom'
import { Box, Tooltip, IconButton, Avatar, Divider } from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import ChatIcon from '@mui/icons-material/Chat'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import { useUIStore, type Section } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'

const RAIL_WIDTH = 56

interface NavItem {
  section: Section
  icon: React.ReactNode
  label: string
  route?: string
}

const navItems: NavItem[] = [
  { section: 'teams', icon: <GroupsIcon />, label: 'Teams' },
  { section: 'chat', icon: <ChatIcon />, label: 'Chat' },
  { section: 'calendar', icon: <CalendarMonthIcon />, label: 'Calendar', route: '/calendar' },
  { section: 'search', icon: <SearchIcon />, label: 'Search', route: '/search' },
]

export default function LeftRail() {
  const navigate = useNavigate()
  const { activeSection, setActiveSection } = useUIStore()
  const { user } = useAuthStore()

  const handleNav = (item: NavItem) => {
    setActiveSection(item.section)
    if (item.route) navigate(item.route)
  }

  return (
    <Box
      sx={{
        width: RAIL_WIDTH,
        flexShrink: 0,
        bgcolor: '#1A1919',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 1200,
      }}
    >
      {/* App icon */}
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
        <GroupsIcon sx={{ color: 'primary.main', fontSize: 28 }} />
      </Box>

      <Divider sx={{ width: '60%', borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />

      {/* Nav items */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', px: 0.5 }}>
        {navItems.map((item) => {
          const isActive = activeSection === item.section
          return (
            <Tooltip key={item.section} title={item.label} placement="right">
              <Box
                onClick={() => handleNav(item)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 1,
                  py: 1,
                  color: isActive ? '#fff' : 'text.secondary',
                  bgcolor: isActive ? 'rgba(98,100,167,0.25)' : 'transparent',
                  position: 'relative',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(98,100,167,0.3)' : 'rgba(255,255,255,0.07)',
                    color: '#fff',
                  },
                }}
              >
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      height: '60%',
                      width: 3,
                      bgcolor: 'primary.main',
                      borderRadius: '0 2px 2px 0',
                    }}
                  />
                )}
                <Box sx={{ fontSize: 22, display: 'flex' }}>{item.icon}</Box>
              </Box>
            </Tooltip>
          )
        })}
      </Box>

      {/* Bottom: Settings + Avatar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 1 }}>
        <Tooltip title="Settings" placement="right">
          <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={`${user?.firstName} ${user?.lastName}`} placement="right">
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: 'primary.main', cursor: 'pointer', fontSize: '0.75rem' }}
            onClick={() => navigate('/profile')}
          >
            {user?.firstName?.charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  )
}
