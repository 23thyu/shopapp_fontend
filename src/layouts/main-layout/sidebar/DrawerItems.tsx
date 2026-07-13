import { useLocation } from 'react-router';
import sitemapAdmin from 'routes/sitemap.admin';
import sitemapCustomer from 'routes/sitemap.customer';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CollapseListItem from './list-items/CollapseListItem';
import ListItem from './list-items/ListItem';
import Image from 'components/base/Image';
import LogoImg from 'assets/images/logo.png';
import IconifyIcon from 'components/base/IconifyIcon';

const DrawerItems = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const currentSitemap = isAdmin ? sitemapAdmin : sitemapCustomer;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/authentication/signin';
  };

  // Dynamically compute the active state of sitemap routes relative to pathname
  const processedSitemap = currentSitemap.map((route) => {
    const isRouteActive = route.path ? pathname === route.path : false;

    const updatedItems = route.items?.map((subItem) => ({
      ...subItem,
      active: pathname === subItem.path,
    }));

    const isAnySubItemActive = updatedItems?.some((subItem) => subItem.active) || false;

    return {
      ...route,
      active: isRouteActive || isAnySubItemActive,
      items: updatedItems,
    };
  });

  return (
    <>
      {/* DNX Light Header (Horizontal Logo & Title matching screenshot) */}
      <Stack
        position="sticky"
        top={0}
        pt={4}
        pb={2.5}
        alignItems="flex-start"
        bgcolor="#ffffff"
        zIndex={1000}
        width={1}
      >
        <ButtonBase component={Link} href={isAdmin ? '/admin/dashboard' : '/'} disableRipple sx={{ justifyContent: 'flex-start' }}>
          <Image src={LogoImg} alt="logo" height={32} width={32} sx={{ mr: 1.5 }} />
          <Typography color="#1a1c1d" sx={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: 0.5, lineHeight: 1 }}>
            HGPHONE
          </Typography>
        </ButtonBase>
      </Stack>

      {/* Main navigation list */}
      <List component="nav" sx={{ mt: 3, mb: 15, px: 0, width: 1 }}>
        {processedSitemap.map((route) =>
          route.items ? (
            <CollapseListItem key={route.id} {...route} />
          ) : (
            <ListItem key={route.id} {...route} />
          ),
        )}
      </List>

      {/* Bottom user profile & actions stack */}
      <Stack
        mt="auto"
        mb={4}
        px={0}
        spacing={2}
        width={1}
      >
        {isAdmin ? (
          /* Admin Specific Footer Card - Light Style */
          <>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2.5,
                bgcolor: '#f4f5f8',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  color: '#ffffff',
                  width: 36,
                  height: 36,
                }}
              >
                <IconifyIcon icon="material-symbols:account-circle" />
              </Avatar>
              <Stack spacing={0.25}>
                <Typography variant="body1" fontWeight="bold" color="#1a1c1d">
                  Admin
                </Typography>
                <Typography variant="caption" color="#7a829a">
                  Super User
                </Typography>
              </Stack>
            </Box>
          </>
        ) : (
          /* Customer Specific Footer */
          <>
            {localStorage.getItem('role') === '2' && (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                component={Link}
                href="/admin/dashboard"
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Vào Quản trị
              </Button>
            )}

            {localStorage.getItem('token') ? (
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleLogout}
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Đăng xuất
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                component={Link}
                href="/authentication/signin"
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Đăng nhập
              </Button>
            )}
          </>
        )}
      </Stack>
    </>
  );
};

export default DrawerItems;
