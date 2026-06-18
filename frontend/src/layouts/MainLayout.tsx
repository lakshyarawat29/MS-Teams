import { Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import LeftRail from '../components/LeftRail'
import Sidebar from '../components/Sidebar'
import { useUIStore } from '../store/uiStore'

export default function MainLayout() {
  const { activeSection } = useUIStore()
  const hideSidebar = activeSection === 'search'

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
          bgcolor: '#292828',
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

