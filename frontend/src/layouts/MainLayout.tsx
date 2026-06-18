import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Box from '@mui/material/Box'
import LeftRail from '../components/LeftRail'
import Sidebar from '../components/Sidebar'
import { useUIStore, type Section } from '../store/uiStore'

function sectionFromPath(path: string): Section {
  if (path.startsWith('/search')) return 'search'
  if (path.startsWith('/calendar')) return 'calendar'
  if (path.startsWith('/dm')) return 'chat'
  return 'teams'
}

export default function MainLayout() {
  const { activeSection, setActiveSection } = useUIStore()
  const location = useLocation()
  const hideSidebar = activeSection === 'search'

  useEffect(() => {
    setActiveSection(sectionFromPath(location.pathname))
  }, [location.pathname])

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <LeftRail />
      {!hideSidebar && <Sidebar />}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#1E1E2E',
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

