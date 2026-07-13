import { useState, ChangeEvent, FormEvent } from 'react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';

interface User {
  [key: string]: string;
}

const Signup = () => {
  const [user, setUser] = useState<User>({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    let avatarUrl = '';

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('images', avatarFile);

        const uploadRes = await fetch('http://localhost:3009/api/register-users/upload-avatar', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadResult.error || 'Tải ảnh đại diện thất bại');
        }
        avatarUrl = uploadResult.url;
      }

      const response = await fetch('http://localhost:3009/api/register-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password,
          phone: user.phone || undefined,
          avatar: avatarUrl || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Đăng ký tài khoản thất bại');
      }
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang Đăng nhập...');
      setTimeout(() => {
        window.location.href = '/authentication/signin';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối tới hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography align="center" variant="h4">
        Đăng ký
      </Typography>
      <Typography mt={1.5} align="center" variant="body2">
        Hãy tham gia cùng chúng tôi! Tạo tài khoản bằng,
      </Typography>

      <Stack mt={3} spacing={1.75} width={1}>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<IconifyIcon icon="logos:google-icon" fontSize={18} />}
          sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.main' } }}
        >
          Google
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<IconifyIcon icon="logos:apple" sx={{ mb: 0.5 }} fontSize={18} />}
          sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.main' } }}
        >
          Apple
        </Button>
      </Stack>

      <Divider sx={{ my: 4 }}>hoặc Đăng ký bằng</Divider>

      <Stack component="form" mt={3} onSubmit={handleSubmit} direction="column" gap={2}>
        {/* Avatar selection & preview */}
        <Stack alignItems="center" mb={1}>
          <Box sx={{ position: 'relative', cursor: 'pointer' }} component="label">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                bgcolor: '#f5f5f7',
                border: '2px dashed #0071e3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Stack alignItems="center" spacing={0.5}>
                  <IconifyIcon icon="material-symbols:add-a-photo-outline" fontSize={24} style={{ color: '#0071e3' }} />
                  <Typography sx={{ fontSize: '11px', color: '#86868b', fontWeight: 500 }}>Ảnh đại diện</Typography>
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>

        <TextField
          id="name"
          name="name"
          type="text"
          value={user.name}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Họ và tên của bạn"
          autoComplete="name"
          fullWidth
          autoFocus
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="hugeicons:user-circle-02" fontSize={18} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="email"
          name="email"
          type="email"
          value={user.email}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Email của bạn"
          autoComplete="email"
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="hugeicons:mail-at-sign-02" fontSize={18} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="phone"
          name="phone"
          type="text"
          value={user.phone}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Số điện thoại (10 chữ số)"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="material-symbols:phone-android-outline" fontSize={18} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={user.password}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Mật khẩu của bạn"
          autoComplete="current-password"
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="hugeicons:lock-key" fontSize={18} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{
                  opacity: user.password ? 1 : 0,
                  pointerEvents: user.password ? 'auto' : 'none',
                }}
              >
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ border: 'none', bgcolor: 'transparent !important' }}
                  edge="end"
                >
                  <IconifyIcon
                    icon={showPassword ? 'fluent-mdl2:view' : 'fluent-mdl2:hide-3'}
                    color="neutral.light"
                    fontSize={18}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button type="submit" variant="contained" size="medium" fullWidth sx={{ mt: 1.5 }} disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </Stack>

      <Typography mt={5} variant="body2" color="text.secondary" align="center" letterSpacing={0.25}>
        Đã có tài khoản? <Link href={paths.signin}>Đăng nhập ngay</Link>
      </Typography>
    </>
  );
};

export default Signup;
