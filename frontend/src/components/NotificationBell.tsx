import { useState, useEffect, useCallback } from 'react'
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  ListItemText, Button, Divider, Tooltip,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { notificationService } from '../services/notificationService'
import { useNotificationSocket } from '../hooks/useRealtime'
import type { Notification } from '../types'
import { useAuthStore } from '../store/authStore'

export default function NotificationBell() {
  const { user } = useAuthStore()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getAll()
      setNotifications(res.data.data)
    } catch { /* ignore */ }
  }

  const loadUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount()
      setUnread(Number(res.data.data))
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadUnreadCount()
  }, [])

  const handleNewNotification = useCallback((n: Notification) => {
    setNotifications((prev) => [n, ...prev])
    setUnread((c) => c + 1)
  }, [])

  useNotificationSocket({ userId: user?.id, onNotification: handleNewNotification })

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget)
    await loadNotifications()
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnread(0)
    } catch { /* ignore */ }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
      setUnread((c) => Math.max(0, c - 1))
    } catch { /* ignore */ }
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpen} size="small">
          <Badge badgeContent={unread} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, maxHeight: 480 } }}
      >
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography fontWeight={600} variant="body2">Notifications</Typography>
          {unread > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List dense sx={{ overflowY: 'auto', maxHeight: 380 }}>
            {notifications.map((n) => (
              <ListItem
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: n.read ? 'transparent' : 'rgba(99,102,241,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <ListItemText
                  primary={n.title}
                  secondary={n.body}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: n.read ? 400 : 600 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}
