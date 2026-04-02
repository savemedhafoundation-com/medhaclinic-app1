import MenuIcon from '@mui/icons-material/Menu';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';
import { useUiStore } from '../store/useUiStore';

const drawerWidth = 280;

const navigationItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon /> },
  { label: 'Users', path: '/users', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Transactions', path: '/transactions', icon: <SwapHorizOutlinedIcon /> },
  { label: 'Withdrawals', path: '/withdrawals', icon: <PaymentsOutlinedIcon /> },
  { label: 'Games', path: '/games', icon: <SportsEsportsOutlinedIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { colorMode, toggleColorMode, mobileNavOpen, setMobileNavOpen } = useUiStore();

  const drawerContent = (
    <Stack sx={{ height: '100%' }}>
      <Stack spacing={1} sx={{ p: 3 }}>
        <Typography color="primary.main" variant="overline">
          Medha Admin
        </Typography>
        <Typography variant="h5">Operations Console</Typography>
        <Typography color="text.secondary" variant="body2">
          Secure admin workspace for users, money movement, game operations, and system health.
        </Typography>
      </Stack>

      <Divider />

      <List sx={{ px: 2, py: 2 }}>
        {navigationItems.map(item => {
          const selected = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileNavOpen(false);
              }}
              selected={selected}
              sx={{
                borderRadius: 3,
                mb: 1,
              }}>
              <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <Stack direction="row" spacing={1.5} sx={{ p: 3 }}>
        <Avatar src={user?.photoURL ?? undefined}>{user?.email?.[0]?.toUpperCase() ?? 'A'}</Avatar>
        <Stack minWidth={0} spacing={0.25}>
          <Typography noWrap variant="subtitle2">
            {user?.displayName ?? user?.email ?? 'Admin user'}
          </Typography>
          <Typography color="text.secondary" noWrap variant="body2">
            {user?.email ?? 'No email'}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar color="inherit" position="fixed" sx={{ ml: { lg: `${drawerWidth}px` }, width: { lg: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ gap: 2 }}>
          {!isDesktop ? (
            <IconButton edge="start" onClick={() => setMobileNavOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : null}

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexGrow: 1 }}>
            <MonitorHeartOutlinedIcon color="primary" />
            <Typography variant="h6">Admin Dashboard</Typography>
          </Stack>

          <Tooltip title={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleColorMode}>
              {colorMode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Sign out">
            <IconButton onClick={() => void signOut()}>
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={() => setMobileNavOpen(false)}
          open={mobileNavOpen}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
          variant="temporary">
          {drawerContent}
        </Drawer>

        <Drawer
          open
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
          variant="permanent">
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pt: { xs: 10, md: 11 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
