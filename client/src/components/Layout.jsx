import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { AppBar, Avatar, Box, Button, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import HubRounded from '@mui/icons-material/HubRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import TaskAltRounded from '@mui/icons-material/TaskAltRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../context/AuthContext';

const WIDTH = { xs: 68, md: 240 };
const links = [
  ['Dashboard', '/', DashboardRounded],
  ['Leads', '/leads', PeopleAltRounded],
  ['Companies', '/companies', BusinessRounded],
  ['Tasks', '/tasks', TaskAltRounded],
];

// Sidebar + top bar stay mounted; only <Outlet /> changes between pages
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{ width: WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: WIDTH, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' } }}
      >
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ height: 64, px: { xs: 0, md: 3 }, justifyContent: { xs: 'center', md: 'flex-start' }, color: 'primary.main' }}>
          <HubRounded />
          <Typography variant="h6" sx={{ fontWeight: 800, display: { xs: 'none', md: 'block' } }}>Mini CRM</Typography>
        </Stack>
        <List sx={{ px: 1.5 }}>
          {links.map(([label, to, Icon]) => (
            <ListItemButton
              key={to}
              component={NavLink}
              to={to}
              end={to === '/'}
              sx={{
                borderRadius: 2, mb: 0.5, justifyContent: { xs: 'center', md: 'flex-start' },
                '&.active': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, '& .MuiListItemIcon-root': { color: '#fff' } },
                '&:not(.active):hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.08) },
              }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 0, md: 40 }, color: 'text.secondary' }}><Icon /></ListItemIcon>
              <ListItemText primary={label} sx={{ display: { xs: 'none', md: 'block' } }} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }} />
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 15, mr: 1.2 }}>{user?.name?.[0]?.toUpperCase()}</Avatar>
            <Typography sx={{ mr: 2, fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
            <Button color="inherit" startIcon={<LogoutRounded />} onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
