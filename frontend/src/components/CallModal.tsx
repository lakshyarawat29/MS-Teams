import { useEffect, useRef } from 'react'
import {
  Box, Dialog, DialogTitle, IconButton, Typography, Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MicOffIcon from '@mui/icons-material/MicOff'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'

interface CallModalProps {
  open: boolean
  onClose: () => void
  roomName: string          // e.g. "teams-clone-channel-abc123"
  displayName: string       // logged-in user's name
  videoOff?: boolean        // voice-only call
  title: string             // "Call with Bob" or "#general"
}

// Sanitise room name so it's URL-safe
function sanitise(s: string) {
  return s.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 64)
}

export default function CallModal({
  open, onClose, roomName, displayName, videoOff = false, title,
}: CallModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<unknown>(null)

  useEffect(() => {
    if (!open || !containerRef.current) return

    // Use Jitsi IFrame API injected via <script> in index.html
    const win = window as unknown as { JitsiMeetExternalAPI?: new (domain: string, opts: Record<string, unknown>) => unknown }
    if (!win.JitsiMeetExternalAPI) {
      // Script not yet loaded – inject it
      const s = document.createElement('script')
      s.src = 'https://meet.jit.si/external_api.js'
      s.async = true
      s.onload = () => mountJitsi()
      document.head.appendChild(s)
    } else {
      mountJitsi()
    }

    function mountJitsi() {
      const API = (window as unknown as { JitsiMeetExternalAPI: new (domain: string, opts: Record<string, unknown>) => { dispose: () => void } }).JitsiMeetExternalAPI
      apiRef.current = new API('meet.jit.si', {
        roomName: sanitise(roomName),
        width: '100%',
        height: '100%',
        parentNode: containerRef.current!,
        userInfo: { displayName },
        configOverwrite: {
          startWithVideoMuted: videoOff,
          startWithAudioMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          disableInviteFunctions: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'settings', 'raisehand', 'videoquality', 'tileview',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: '#1A1A2E',
          NATIVE_APP_NAME: 'Teams Clone',
        },
      })

      // Auto-close when the last participant leaves
      ;(apiRef.current as { addEventListener: (e: string, cb: () => void) => void })
        .addEventListener('videoConferenceLeft', () => {
          handleClose()
        })
    }

    return () => {
      handleClose()
    }
  }, [open])

  const handleClose = () => {
    if (apiRef.current) {
      try { (apiRef.current as { dispose: () => void }).dispose() } catch { /* ignore */ }
      apiRef.current = null
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          bgcolor: '#0D0D0E',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)',
          height: '90vh',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(255,255,255,0.03)',
          gap: 1.5,
        }}
      >
        {videoOff
          ? <MicOffIcon sx={{ color: '#6264A7', fontSize: 20 }} />
          : <VideocamOffIcon sx={{ color: '#6264A7', fontSize: 20 }} />}
        <Typography variant="subtitle2" fontWeight={600}>
          {videoOff ? 'Voice Call' : 'Video Call'} — {title}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="End call">
          <IconButton size="small" onClick={handleClose} sx={{ color: 'error.main' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Jitsi container */}
      <Box ref={containerRef} sx={{ flex: 1, height: 'calc(100% - 48px)', width: '100%' }} />
    </Dialog>
  )
}
