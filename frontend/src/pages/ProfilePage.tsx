import { useState, useEffect } from 'react'
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Paper, Snackbar, Alert, CircularProgress, Divider,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { userService } from '../services/userService'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import type { UserStatus } from '../types'

const STATUS_OPTIONS: UserStatus[] = ['ONLINE', 'AWAY', 'BUSY', 'OFFLINE']

export default function ProfilePage() {
  const { user, setAuth, token, refreshToken, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [bio, setBio] = useState('')
  const [status, setStatus] = useState<UserStatus>(user?.status ?? 'ONLINE')
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await userService.getMe()
      const u = res.data.data
      setFirstName(u.firstName)
      setLastName(u.lastName)
      setStatus(u.status ?? 'ONLINE')
    } catch { /* ignore */ }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await userService.updateProfile({ firstName, lastName, bio })
      if (user && token) {
        setAuth({ ...user, firstName, lastName }, token, refreshToken ?? '')
      }
      setSnack({ msg: 'Profile updated!', type: 'success' })
    } catch {
      setSnack({ msg: 'Failed to update profile.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: UserStatus) => {
    setStatus(newStatus)
    try {
      await userService.updateStatus(newStatus)
      if (user && token) {
        setAuth({ ...user, status: newStatus }, token, refreshToken ?? '')
      }
    } catch {
      setSnack({ msg: 'Failed to update status.', type: 'error' })
    }
  }

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken)
    } catch { /* ignore — clear locally regardless */ }
    clearAuth()
    navigate('/login')
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Profile</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Personal Info</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="First Name"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Box>
        <TextField
          label="Bio (optional)"
          fullWidth
          multiline
          rows={2}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSaveProfile}
          disabled={saving || !firstName.trim() || !lastName.trim()}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          Save Profile
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Status</Typography>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => handleStatusChange(e.target.value as UserStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Account</Typography>
        <Divider sx={{ mb: 2 }} />
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </Paper>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.type} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
