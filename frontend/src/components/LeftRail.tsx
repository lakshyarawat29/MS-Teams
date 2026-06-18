import { useNavigate } from 'react-router-dom'
import { Box, Tooltip, Avatar, Typography, Badge } from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import ChatIcon from '@mui/icons-material/Chat'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import { useUIStore, type Section } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'

const RAIL_WIDTH = 72

interface NavItem {
  section: Section
  icon: React.ReactNode
  label: string
  route?: string
}

const navItems: NavItem[] = [
  { section: 'teams',    icon: <GroupsIcon />,         label: 'Teams' },
  { section: 'chat',     icon: <ChatIcon />,           label: 'Chat' },
  { section: 'calendar', icon: <CalendarMonthIcon />,  label: 'Calendar', route: '/calendar' },
  { section: 'search',   icon: <SearchIcon />,         label: 'Search',   route: '/search' },
]

function stringToGradient(name: string) {
  const colors = [
    ['#7C7FD4', '#5558B0'],
    ['#F38BA8', '#E06C8A'],
    ['#A6E3A1', '#5A9E56'],
    ['#F9E2AF', '#D4A848'],
    ['#89DCEB', '#4FAFC0'],
    ['#CBA6F7', '#9A5FD4'],
  ]
  const idx = (name.charCodeAt(0) ?? 0) % colors.length
  return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`
}

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
        bgcolor: '#13131F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1.5,
        borderRight: '1px solid rgba(205,214,244,0.06)',
        zIndex: 1200,
        gap: 0.5,
      }}
    >
      {/* App logo */}
      <Box
        sx={{
          width: 40, height: 40,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #7C7FD4, #5558B0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 1.5,
          boxShadow: '0 4px 16px rgba(124,127,212,0.4)',
        }}
      >
        <GroupsIcon sx={{ color: '#fff', fontSize: 22 }} />
      </Box>

      {/* Nav items */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', px: 0.75 }}>
        {navItems.map((item) => {
          const isActive = activeSection === item.section
          return (
            <Tooltip key={item.section} title={item.label} placement="right" arrow>
              <Box
                onClick={() => handleNav(item)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.4,
                  cursor: 'pointer',
                  borderRadius: 2,
                  py: 1,
                  px: 0.5,
                  color: isActive ? '#CDD6F4' : '#6C7086',
                  bgcolor: isActive ? 'rgba(124,127,212,0.2)' : 'transparent',
                  position: 'relative',
                  transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(124,127,212,0.28)' : 'rgba(205,214,244,0.07)',
                    color: '#CDD6F4',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { transform: 'scale(0.96)' },
                }}
              >
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -3,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '60%',
                      width: 3,
                      bgcolor: 'primary.main',
                      borderRadius: '0 3px 3px 0',
                      boxShadow: '0 0 8px rgba(124,127,212,0.6)',
                    }}
                  />
                )}
                <Box sx={{ fontSize: 22, display: 'flex' }}>{item.icon}</Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.03em',
                    lineHeight: 1,
                    color: 'inherit',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>

      {/* Bottom: Settings + Avatar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Tooltip title="Settings / Profile" placement="right" arrow>
          <Box
            onClick={() => navigate('/profile')}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.4,
              cursor: 'pointer',
              color: '#6C7086',
              p: 0.75,
              borderRadius: 2,
              transition: 'all 0.18s',
              '&:hover': { color: '#CDD6F4', bgcolor: 'rgba(205,214,244,0.07)', transform: 'translateY(-1px)' },
            }}
          >
            <SettingsIcon sx={{ fontSize: 20 }} />
            <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 500, lineHeight: 1 }}>
              Settings
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title={`${user?.firstName} ${user?.lastName} â€” Profile`} placement="right" arrow>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#A6E3A1', border: '2px solid #13131F' }} />
            }
          >
            <Avatar
              onClick={() => navigate('/profile')}
              sx={{
                width: 34, height: 34,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: stringToGradient(user?.firstName ?? 'U'),
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.18s, box-shadow 0.18s',
                '&:hover': { transform: 'scale(1.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' },
              }}
            >
              {user?.firstName?.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </Tooltip>
      </Box>
    </Box>
  )
}
