import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import DrawerItems from './DrawerItems';
import { useLocation } from 'react-router';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ mobileOpen, setMobileOpen, setIsClosing }: SidebarProps) => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  return (
    <Box
      component="nav"
      width={{ lg: 252 }}
      flexShrink={{ lg: 0 }}
      display={{ xs: 'none', lg: 'block' }}
      zIndex={1300}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0, 0, 0, 0.06)',
            padding: '0 24px',
          }
        }}
        sx={{ display: { xs: 'block', lg: 'none' } }}
      >
        <DrawerItems />
      </Drawer>

      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0, 0, 0, 0.06)',
            padding: '0 24px',
          }
        }}
        sx={{ display: { xs: 'none', lg: 'block' } }}
        open
      >
        <DrawerItems />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
