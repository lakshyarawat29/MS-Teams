import { Box, Typography, Avatar, Badge, IconButton, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { TeamMember } from '../types'

function stringToColor(str: string): string {
  const colors = ['#6264A7', '#4B8A4E', '#C25E5E', '#B5632A', '#2E7DB5', '#7B4EA6', '#A6632A', '#4E6CA6']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

interface MembersPanelProps {
  members: TeamMember[]
  onClose: () => void
}

function MemberItem({ member }: { member: TeamMember }) {
  const bg = stringToColor(`${member.firstName}${member.lastName}`)
  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 0.75,
        '&:hover': { bgcolor: 'rgba(205,214,244,0.04)' },
        cursor: 'default',
        transition: 'background 0.12s',
      }}
    >
      <Avatar sx={{ width: 30, height: 30, fontSize: '0.72rem', bgcolor: bg, flexShrink: 0 }}>
        {initials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }} noWrap>
          {member.firstName} {member.lastName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
          {member.role.toLowerCase()}
        </Typography>
      </Box>
    </Box>
  )
}

export default function MembersPanel({ members, onClose }: MembersPanelProps) {
  const owners = members.filter((m) => m.role === 'OWNER' || m.role === 'ADMIN')
  const regular = members.filter((m) => m.role === 'MEMBER')

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderLeft: '1px solid rgba(205,214,244,0.08)',
        bgcolor: '#181825',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(205,214,244,0.08)',
          minHeight: 52,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
          Members
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75, fontSize: '0.78rem' }}>
            {members.length}
          </Typography>
        </Typography>
        <Tooltip title="Close panel">
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Member list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2 },
        }}
      >
        {owners.length > 0 && (
          <>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 2,
                pt: 1.5,
                pb: 0.5,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.67rem',
                letterSpacing: '0.07em',
                fontWeight: 700,
              }}
            >
              Admins — {owners.length}
            </Typography>
            {owners.map((m) => <MemberItem key={m.userId} member={m} />)}
          </>
        )}

        {regular.length > 0 && (
          <>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 2,
                pt: 1.5,
                pb: 0.5,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.67rem',
                letterSpacing: '0.07em',
                fontWeight: 700,
              }}
            >
              Members — {regular.length}
            </Typography>
            {regular.map((m) => <MemberItem key={m.userId} member={m} />)}
          </>
        )}
      </Box>
    </Box>
  )
}
