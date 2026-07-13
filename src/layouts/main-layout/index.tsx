import { useState, PropsWithChildren } from 'react';
import { useLocation } from 'react-router';
import Stack from '@mui/material/Stack';
import Sidebar from 'layouts/main-layout/sidebar/Sidebar';
import Topbar from 'layouts/main-layout/topbar/Topbar';
import CustomerHeader from 'components/common/CustomerHeader';
import CustomerFooter from 'components/common/CustomerFooter';

const MainLayout = ({ children }: PropsWithChildren) => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Stack width={1} minHeight="100vh">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} setIsClosing={setIsClosing} />
        <Stack
          component="main"
          direction="column"
          width={{ xs: 1, lg: 'calc(100% - 252px)' }}
          flexGrow={1}
        >
          <Topbar isClosing={isClosing} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          {children}
        </Stack>
      </Stack>
    );
  }

  // Customer layout
  return (
    <Stack width={1} minHeight="100vh" direction="column">
      <CustomerHeader />
      <Stack
        component="main"
        direction="column"
        width={1}
        flexGrow={1}
      >
        {children}
      </Stack>
      <CustomerFooter />
    </Stack>
  );
};

export default MainLayout;
