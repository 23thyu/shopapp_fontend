import { useState, useEffect } from 'react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import LogoImg from 'assets/images/logo.png';
import ProfileMenu from './ProfileMenu';
import { api } from 'services/api';

interface TopbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }: TopbarProps) => {
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const bellOpen = Boolean(bellAnchorEl);

  const checkNewOrders = async (isFirstLoad = false) => {
    try {
      const res = await api.getOrders();
      const orderList = Array.isArray(res) ? res : (res?.data || []);
      
      if (orderList.length > 0) {
        const maxId = Math.max(...orderList.map((o: any) => o.id));
        const lastSeenIdStr = localStorage.getItem('lastSeenOrderId');
        const lastSeenId = lastSeenIdStr ? parseInt(lastSeenIdStr, 10) : 0;

        if (isFirstLoad) {
          if (!lastSeenIdStr) {
            localStorage.setItem('lastSeenOrderId', String(maxId));
            setHasNewOrder(false);
          } else if (maxId > lastSeenId) {
            setHasNewOrder(true);
          }
        } else {
          if (maxId > lastSeenId) {
            setHasNewOrder(true);
            setToastMessage('Bạn có thêm 1 đơn hàng');
            setToastOpen(true);
            localStorage.setItem('lastSeenOrderId', String(maxId));
          }
        }
        setOrders(orderList);
      }
    } catch (err) {
      console.error('Error checking new orders:', err);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === '2') { // Admin
      checkNewOrders(true);

      const interval = setInterval(() => {
        checkNewOrders(false);
      }, 10000); // Check every 10s

      return () => clearInterval(interval);
    }
  }, []);

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setBellAnchorEl(event.currentTarget);
    setHasNewOrder(false);
    if (orders.length > 0) {
      const maxId = Math.max(...orders.map((o: any) => o.id));
      localStorage.setItem('lastSeenOrderId', String(maxId));
    }
  };

  const handleBellClose = () => {
    setBellAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      px={3.5}
      height={90}
      alignItems="center"
      justifyContent="space-between"
      bgcolor="info.lighter"
      position="sticky"
      top={0}
      zIndex={1200}
    >
      <Stack spacing={{ xs: 1, sm: 2 }} alignItems="center">
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{ lineHeight: 0, display: { xs: 'none', sm: 'block', lg: 'none' } }}
        >
          <Image src={LogoImg} alt="logo" height={54} width={54} />
        </ButtonBase>

        <Toolbar sx={{ display: { xm: 'block', lg: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
          >
            <IconifyIcon icon="clarity:menu-line" fontSize={22} />
          </IconButton>
        </Toolbar>

        <Toolbar sx={{ display: { xm: 'block', md: 'none' } }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="search">
            <IconifyIcon icon="mynaui:search" fontSize={22} />
          </IconButton>
        </Toolbar>

        <TextField
          variant="filled"
          placeholder="Search Task"
          sx={{ width: 350, display: { xs: 'none', md: 'flex' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconifyIcon icon="mynaui:search" fontSize={18} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack spacing={{ xs: 1, sm: 2 }} alignItems="center">
        <IconButton size="large" onClick={handleBellClick}>
          <Badge color="error" variant={hasNewOrder ? 'dot' : undefined}>
            <IconifyIcon icon="solar:bell-outline" fontSize={22} />
          </Badge>
        </IconButton>
        <ProfileMenu />
      </Stack>

      {/* Live Order Notifications Dropdown */}
      <Menu
        anchorEl={bellAnchorEl}
        id="notification-menu"
        open={bellOpen}
        onClose={handleBellClose}
        onClick={handleBellClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 320,
            maxHeight: 400,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
            borderRadius: 3,
            [`& .MuiList-root`]: {
              p: 0,
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box p={2}>
          <Typography variant="subtitle1" fontWeight="bold">Thông báo đơn hàng</Typography>
        </Box>
        <Divider sx={{ my: 0 }} />
        <Box sx={{ p: 1 }}>
          {orders.slice(0, 5).map((order) => (
            <MenuItem
              key={order.id}
              onClick={() => {
                handleBellClose();
                window.location.href = '/admin/orders';
              }}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                mb: 0.5,
                whiteSpace: 'normal',
                '&:hover': { bgcolor: 'info.lighter' }
              }}
            >
              <Stack direction="column" spacing={0.5} width={1}>
                <Stack direction="row" justifyContent="space-between" width={1}>
                  <Typography variant="body2" fontWeight="bold">Đơn hàng #{order.id}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Khách hàng: {order.User?.name || 'Ẩn danh'}
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="primary.main">
                  Tổng: {order.total?.toLocaleString('vi-VN')} đ
                </Typography>
              </Stack>
            </MenuItem>
          ))}
          {orders.length === 0 && (
            <Box py={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">Không có đơn hàng nào</Typography>
            </Box>
          )}
        </Box>
      </Menu>

      {/* Floating alert for new orders */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="info" variant="filled" sx={{ width: '100%', fontWeight: 'bold' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default Topbar;
