import { useState, useEffect, useRef } from 'react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import LogoImg from 'assets/images/logo.png';
import { api } from 'services/api';
import MediaSelector from 'components/base/MediaSelector';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
];

const NAV_ITEMS = [
  { name: 'iPhone', query: 'iPhone' },
  { name: 'Mac', query: 'Mac' },
  { name: 'iPad', query: 'iPad' },
  { name: 'Watch', query: 'Watch' },
  { name: 'Tai nghe, Loa', query: 'Tai nghe, Loa' },
  { name: 'Phụ kiện', query: 'Phụ kiện' },
  { name: 'Hỗ Trợ', query: 'Support' }
];

const CustomerHeader = () => {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any | null>(null);

  // State for mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for profile menu and dialog
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfileDialog = () => {
    if (user) {
      setProfileName(user.name || '');
      setProfileAvatar(user.avatar || '');
      setChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSubmitError(null);
      setProfileDialogOpen(true);
    }
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!profileName.trim()) {
      setSubmitError('Tên hiển thị không được để trống.');
      return;
    }
    if (changePassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        setSubmitError('Vui lòng điền đầy đủ thông tin mật khẩu.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSubmitError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
        return;
      }
      if (newPassword.length < 6) {
        setSubmitError('Mật khẩu mới phải từ 6 ký tự trở lên.');
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: any = {
        name: profileName.trim(),
        avatar: profileAvatar.trim(),
      };
      if (changePassword) {
        payload.old_password = oldPassword;
        payload.new_password = newPassword;
      }
      const response = await api.updateProfile(user.id, payload);
      if (response && response.data) {
        const updatedUser = {
          ...user,
          name: response.data.name,
          avatar: response.data.avatar,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSubmitSuccess('Cập nhật tài khoản thành công!');
        setProfileDialogOpen(false);
      } else {
        setSubmitError('Không nhận được phản hồi từ máy chủ.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const activeCategory = params.get('category_name') || '';
  const isNewsPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/news');
  const isSupportPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/support');

  const isActive = (item: any) => {
    if (item.query === 'Support') {
      return isSupportPage;
    }
    return activeCategory.toLowerCase() === item.query.toLowerCase();
  };

  const searchRef = useRef<HTMLInputElement>(null);

  const updateCartCount = () => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Initial load
    updateCartCount();

    // Check user profile
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }

    // Listen to storage events to auto update cart count across tabs/actions
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for same-page updates
    window.addEventListener('cart-updated', handleStorageChange);

    // Fetch categories and brands for filter dropdowns
    api.getCategories().then((res: any) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      setCategories(data);
    }).catch(() => {});

    api.getBrands().then((res: any) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      setBrands(data);
    }).catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/authentication/signin';
  };

  const handleNavClick = (queryName: string) => {
    if (queryName === 'Support') {
      window.location.href = '/support';
      return;
    }
    // Filter storefront products
    window.location.href = `/?category_name=${encodeURIComponent(queryName)}`;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('q', searchInput.trim());
    if (selectedCategory) params.set('category_name', selectedCategory);
    if (selectedBrand) params.set('brand_name', selectedBrand);
    const qs = params.toString();
    window.location.href = qs ? `/?${qs}` : '/';
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  return (
    <Stack direction="column" width={1} zIndex={1200}>
      {/* 2. Main Navigation Navbar */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          top: 0,
          borderRadius: 0,
        }}
      >
        {/* Main nav row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width={1}
          px={{ xs: 2, md: 6 }}
          sx={{ height: '48px' }}
        >
          {/* Left Section: Menu Button & Logo */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => {
                if (window.innerWidth < 1200) {
                  setMobileMenuOpen(true);
                } else {
                  window.location.href = '/';
                }
              }}
              size="small"
              sx={{
                p: 0.5,
                color: 'rgba(0, 0, 0, 0.8)',
                '&:hover': { color: '#000000' },
                transition: 'color 0.2s ease-in-out'
              }}
            >
              <IconifyIcon 
                icon={mobileMenuOpen ? "material-symbols:close" : "material-symbols:menu"} 
                fontSize="22px" 
                sx={{ display: { xs: 'block', lg: 'none' } }} 
              />
              <IconifyIcon 
                icon="material-symbols:apps" 
                fontSize="18px" 
                sx={{ display: { xs: 'none', lg: 'block' } }} 
              />
            </IconButton>

            <Link
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': { opacity: 0.8 },
                transition: 'opacity 0.2s ease-in-out'
              }}
            >
              <Image src={LogoImg} alt="logo" height={36} width={36} />
            </Link>
          </Stack>

          {/* Navigation Items (Middle) */}
          <Stack
            direction="row"
            spacing={4.5}
            alignItems="center"
            sx={{ display: { xs: 'none', lg: 'flex' } }}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Typography
                  key={item.name}
                  variant="body2"
                  sx={{
                    color: active ? '#000000' : 'rgba(0, 0, 0, 0.8)',
                    cursor: 'pointer',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 400,
                    letterSpacing: '-0.01em',
                    transition: 'color 0.25s ease-in-out, font-weight 0.25s ease-in-out',
                    '&:hover': { color: '#000000' }
                  }}
                  onClick={() => handleNavClick(item.query)}
                >
                  {item.name}
                </Typography>
              );
            })}
          </Stack>

          {/* Utility Actions (Right Icons) */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Search Icon — toggles search bar */}
            <IconButton
              onClick={toggleSearch}
              size="small"
              sx={{
                p: 0.5,
                color: 'rgba(0, 0, 0, 0.8)',
                bgcolor: searchOpen ? 'rgba(0, 0, 0, 0.06)' : 'transparent',
                borderRadius: 1.5,
                '&:hover': { color: '#000000' },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <IconifyIcon icon="mynaui:search" fontSize="18px" />
            </IconButton>

            {/* My Orders */}
            {user && (
              <IconButton
                href="/my-orders"
                size="small"
                sx={{
                  p: 0.5,
                  color: 'rgba(0, 0, 0, 0.8)',
                  '&:hover': { color: '#000000' },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <IconifyIcon icon="material-symbols:receipt-long-outline" fontSize="18px" />
              </IconButton>
            )}

            {/* Shopping Cart */}
            <IconButton
              href="/cart"
              size="small"
              sx={{
                p: 0.5,
                color: 'rgba(0, 0, 0, 0.8)',
                '&:hover': { color: '#000000' },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Badge
                badgeContent={cartCount}
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '9px',
                    height: '14px',
                    minWidth: '14px',
                    padding: '0 3px',
                    bgcolor: '#000000',
                    color: '#ffffff',
                    top: 2,
                    right: 2
                  }
                }}
              >
                <IconifyIcon icon="material-symbols:shopping-bag-outline" fontSize="18px" />
              </Badge>
            </IconButton>

            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ mx: 1.0, height: '14px', alignSelf: 'center', borderColor: 'rgba(0, 0, 0, 0.1)' }}
            />

            {/* User Account Account/Profile */}
            {user ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{
                    p: 0.25,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Avatar
                    src={user.avatar || undefined}
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: '11px',
                      fontWeight: 600,
                      bgcolor: '#000000',
                      color: '#ffffff'
                    }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  onClick={handleProfileMenuClose}
                  sx={{
                    mt: 1,
                    '& .MuiPaper-root': {
                      borderRadius: 3,
                      minWidth: 200,
                      boxShadow: '0px 10px 30px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      p: 0.5
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#1d1d1f' }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#86868b', display: 'block' }}>
                      {user.email || user.phone}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 0.5 }} />
                  
                  <MenuItem 
                    onClick={handleOpenProfileDialog}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'rgba(0,0,0,0.8)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#000' }
                    }}
                  >
                    <IconifyIcon icon="material-symbols:account-circle-outline" fontSize="18px" style={{ marginRight: '10px' }} />
                    Cập nhật tài khoản
                  </MenuItem>

                  {localStorage.getItem('role') === '2' && (
                    <MenuItem 
                      onClick={() => window.location.href = '/admin/dashboard'}
                      sx={{
                        borderRadius: 1.5,
                        py: 1,
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'rgba(0,0,0,0.8)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#000' }
                      }}
                    >
                      <IconifyIcon icon="material-symbols:dashboard-customize-outline" fontSize="18px" style={{ marginRight: '10px' }} />
                      Quản trị
                    </MenuItem>
                  )}

                  <Divider sx={{ my: 0.5 }} />

                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#d32f2f',
                      '&:hover': { bgcolor: 'rgba(211,47,47,0.04)' }
                    }}
                  >
                    <IconifyIcon icon="material-symbols:logout" fontSize="18px" style={{ marginRight: '10px' }} />
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link
                href="/authentication/signin"
                sx={{
                  color: 'rgba(0, 0, 0, 0.8)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  '&:hover': { color: '#000000' },
                  transition: 'color 0.2s ease-in-out'
                }}
              >
                Đăng nhập
              </Link>
            )}
          </Stack>
        </Stack>

        {/* Search & Filters Row (expandable) — full width below nav row */}
        <Collapse in={searchOpen} timeout={300}>
          <Box
            sx={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              px: { xs: 2, md: 6 },
              py: 1.5,
              bgcolor: '#f7f7f7',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              {/* Search input */}
              <TextField
                inputRef={searchRef}
                size="small"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                fullWidth
                variant="outlined"
                sx={{
                  bgcolor: '#fff',
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="mynaui:search" style={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Category filter */}
              <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
                <Select
                  displayEmpty
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ bgcolor: '#fff', borderRadius: 2 }}
                >
                  <MenuItem value="">Tất cả danh mục</MenuItem>
                  {categories.map((c: any) => (
                    <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Brand filter */}
              <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
                <Select
                  displayEmpty
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  sx={{ bgcolor: '#fff', borderRadius: 2 }}
                >
                  <MenuItem value="">Tất cả thương hiệu</MenuItem>
                  {brands.map((b: any) => (
                    <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Search button */}
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  flexShrink: 0,
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 700,
                  bgcolor: '#000',
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                Tìm kiếm
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      {/* Dialog Cập nhật tài khoản */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={handleCloseProfileDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            px: 1,
            py: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1, color: '#1d1d1f' }}>
          Cập nhật tài khoản
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack direction="column" spacing={2.5} sx={{ mt: 1 }}>
            {submitError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            {/* Avatar Preview */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={profileAvatar || undefined}
                sx={{
                  width: 56,
                  height: 56,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: '#000000',
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: 700
                }}
              >
                {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Stack direction="column" spacing={0.5} flexGrow={1}>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#86868b' }}>
                  ẢNH ĐẠI DIỆN HIỆN TẠI
                </Typography>
                <Typography variant="body2" sx={{ color: '#515154', fontSize: '11px', lineHeight: 1.3 }}>
                  Chọn từ danh sách bên dưới hoặc tải lên & cắt ảnh tuỳ chỉnh.
                </Typography>
              </Stack>
            </Stack>

            {/* Preset Avatars Selection */}
            <Stack direction="column" spacing={1}>
              <Typography variant="caption" fontWeight={700} sx={{ color: '#86868b' }}>
                CHỌN AVATAR MẪU NHANH
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px', py: 0.5 }}>
                {PRESET_AVATARS.map((av) => (
                  <IconButton
                    key={av}
                    onClick={() => setProfileAvatar(av)}
                    sx={{
                      p: 0.25,
                      border: '2px solid',
                      borderColor: profileAvatar === av ? '#000000' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <Avatar src={av} sx={{ width: 32, height: 32 }} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>

            {/* MediaSelector to upload & crop avatar */}
            <MediaSelector
              label="TẢI LÊN HOẶC CHỌN TỪ THƯ VIỆN"
              value={profileAvatar}
              onChange={(url) => setProfileAvatar(url)}
              aspectRatio={1}
              cropShape="round"
              onlyUpload={true}
            />

            {/* Inputs */}
            <TextField
              label="Tên hiển thị"
              variant="outlined"
              size="small"
              fullWidth
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              disabled={submitting}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            {/* Change Password Toggle Button */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setChangePassword((prev) => !prev)}
              startIcon={<IconifyIcon icon={changePassword ? "material-symbols:lock-open-outline" : "material-symbols:lock-outline"} />}
              sx={{
                borderRadius: 2,
                color: '#1d1d1f',
                borderColor: 'rgba(0,0,0,0.15)',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12px',
                py: 1,
                width: '100%',
                '&:hover': {
                  borderColor: '#000000',
                  bgcolor: 'rgba(0,0,0,0.02)'
                }
              }}
            >
              {changePassword ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu tài khoản'}
            </Button>

            <Collapse in={changePassword}>
              <Stack direction="column" spacing={2} sx={{ pt: 1, pb: 0.5 }}>
                <TextField
                  label="Mật khẩu hiện tại"
                  type="password"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Mật khẩu mới"
                  type="password"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Stack>
            </Collapse>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button 
            onClick={handleCloseProfileDialog} 
            disabled={submitting}
            sx={{ 
              borderRadius: 2, 
              color: '#86868b', 
              fontWeight: 600, 
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={submitting}
            sx={{
              borderRadius: 2,
              bgcolor: '#000000',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: '#222222' }
            }}
          >
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo thành công */}
      <Snackbar
        open={Boolean(submitSuccess)}
        autoHideDuration={4000}
        onClose={() => setSubmitSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSubmitSuccess(null)} severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          {submitSuccess}
        </Alert>
      </Snackbar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 250,
            bgcolor: '#ffffff',
            boxShadow: '4px 0px 30px rgba(0,0,0,0.08)',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Image src={LogoImg} alt="logo" height={30} width={30} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}>
              HG PHONE
            </Typography>
          </Stack>
          <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
            <IconifyIcon icon="material-symbols:close" fontSize="20px" />
          </IconButton>
        </Box>
        <List sx={{ p: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    handleNavClick(item.query);
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: active ? 'rgba(0, 113, 227, 0.08)' : 'transparent',
                    color: active ? '#0071e3' : 'rgba(0, 0, 0, 0.8)',
                    '&:hover': {
                      bgcolor: active ? 'rgba(0, 113, 227, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemText 
                    primary={item.name} 
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: active ? 700 : 500,
                      fontFamily: '"SF Pro Text", -apple-system, sans-serif'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </Stack>
  );
};

export default CustomerHeader;
