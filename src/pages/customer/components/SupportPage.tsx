import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import IconifyIcon from 'components/base/IconifyIcon';

// Import local images
import IpDeskIcon from 'assets/images/IP_Desk_25.png';
import MacDeskIcon from 'assets/images/Mac_Desk_25.png';
import IpadDeskIcon from 'assets/images/Ipad_Desk_25.png';
import WatchDeskIcon from 'assets/images/Watch_Desk.png';
import SpeakerDeskIcon from 'assets/images/Speaker_Desk_25.png';
import AppleLogoBlue from 'assets/images/support-home-apple-logo-circle-blue.png';
import AppleCareBanner from 'assets/images/tile-side-applecare.image.large_2x.png';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const categories = [
    { name: 'iPhone', image: IpDeskIcon, query: 'iPhone' },
    { name: 'Máy Mac', image: MacDeskIcon, query: 'Mac' },
    { name: 'iPad', image: IpadDeskIcon, query: 'iPad' },
    { name: 'Watch', image: WatchDeskIcon, query: 'Watch' },
    { name: 'AirPods', image: SpeakerDeskIcon, query: 'Tai nghe, Loa' },
  ];

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (q) {
        window.location.href = `/?q=${encodeURIComponent(q)}`;
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <Stack
      width={1}
      direction="column"
      minHeight="100vh"
      alignItems="center"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        pt: { xs: 6, md: 8 },
      }}
    >
      {/* Apple Support Circular Blue Badge Logo */}
      <Box
        sx={{
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <img
          src={AppleLogoBlue}
          alt="Apple Support Logo"
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Main Title Section */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '32px', md: '44px' },
          fontWeight: 700,
          color: '#1d1d1f',
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          mb: 1.5,
          textAlign: 'center',
        }}
      >
        Hỗ trợ của Apple
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: '16px', md: '18px' },
          color: '#515154',
          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          mb: 6,
          textAlign: 'center',
        }}
      >
        Bạn cần trợ giúp? Bắt đầu tại đây.
      </Typography>

      {/* Category Icons Row */}
      <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 960, mx: 'auto', mb: 8, px: 2 }}>
        {categories.map((cat) => (
          <Grid item xs={6} sm={4} md={2} key={cat.name} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="a"
              href={`/?category_name=${encodeURIComponent(cat.query)}`}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  '& .category-text': {
                    textDecoration: 'underline',
                    color: '#0066cc',
                  }
                },
              }}
            >
              <Box
                sx={{
                  height: 72,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              <Typography
                className="category-text"
                sx={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1d1d1f',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  textAlign: 'center',
                  transition: 'color 0.2s ease',
                }}
              >
                {cat.name}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Lower Gray Background Area */}
      <Stack
        direction="column"
        sx={{
          backgroundColor: '#f5f5f7',
          py: 8,
          width: '100%',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container maxWidth="lg">
          {/* Search section */}
          <Stack spacing={3} alignItems="center" sx={{ mb: 7 }} direction="column">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '24px', md: '32px' },
                fontWeight: 700,
                color: '#1d1d1f',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textAlign: 'center',
              }}
            >
              Tìm kiếm các chủ đề khác
            </Typography>

            <TextField
              placeholder="Hỗ trợ tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 1 }}>
                    <IconifyIcon icon="material-symbols:search" width="24" height="24" style={{ color: '#86868b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: '100%',
                maxWidth: 600,
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: '#d2d2d7',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#86868b',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0071e3',
                    borderWidth: '1.5px',
                  },
                },
                '& .MuiInputBase-input': {
                  py: 1.8,
                  fontSize: '16px',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
              }}
            />
          </Stack>

          {/* AppleCare Banner Card */}
          <Card
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              borderRadius: '24px',
              border: 'none',
              boxShadow: 'none',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              maxWidth: 900,
              mx: 'auto',
            }}
          >
            {/* Collage image */}
            <Box
              sx={{
                flex: 1.1,
                minHeight: { xs: 240, md: 360 },
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={AppleCareBanner}
                alt="AppleCare Products"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>

            {/* Content info */}
            <Stack
              sx={{
                flex: 1,
                p: { xs: 4, md: 6 },
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
              spacing={2}
              direction="column"
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '24px', md: '30px' },
                  fontWeight: 700,
                  color: '#1d1d1f',
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  lineHeight: 1.2,
                }}
              >
                Được xử lý thông qua AppleCare
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: '14px', md: '15px' },
                  color: '#515154',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  lineHeight: 1.6,
                }}
              >
                Mọi gói AppleCare đều cung cấp dịch vụ bảo dưỡng tập trung cho sản phẩm Apple, với dịch vụ sửa chữa nhanh chóng, dễ dàng cho các sự cố như đánh rơi và làm đổ chất lỏng.
              </Typography>

              <Button
                onClick={() => setModalOpen(true)}
                sx={{
                  color: '#0066cc',
                  fontSize: '15px',
                  fontWeight: 500,
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 0,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Tìm hiểu thêm <span style={{ marginLeft: '4px' }}>&gt;</span>
              </Button>
            </Stack>
          </Card>
        </Container>
      </Stack>

      {/* AppleCare Info Dialog Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 3,
          },
        }}
      >
        <Stack spacing={3} direction="column">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: '22px',
                color: '#1d1d1f',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Chương trình bảo vệ AppleCare+
            </Typography>
            <IconButton onClick={() => setModalOpen(false)}>
              <IconifyIcon icon="material-symbols:close" width="24" height="24" />
            </IconButton>
          </Stack>

          <Divider />

          <Stack spacing={2.5} direction="column">
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ color: '#0071e3', mt: 0.5, display: 'flex' }}>
                <IconifyIcon icon="material-symbols:verified-user" width="28" height="28" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 0.5, color: '#1d1d1f' }}>
                  Bảo hành toàn diện kéo dài
                </Typography>
                <Typography sx={{ color: '#515154', fontSize: '13.5px', lineHeight: 1.5 }}>
                  Gia hạn thời gian bảo hành chính hãng từ Apple lên đến 2 hoặc 3 năm kể từ ngày mua thiết bị của bạn.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ color: '#d93838', mt: 0.5, display: 'flex' }}>
                <IconifyIcon icon="material-symbols:build" width="28" height="28" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 0.5, color: '#1d1d1f' }}>
                  Dịch vụ sửa chữa tai nạn không giới hạn
                </Typography>
                <Typography sx={{ color: '#515154', fontSize: '13.5px', lineHeight: 1.5 }}>
                  Bảo vệ thiết bị trước các sự cố rơi vỡ màn hình, va đập mạnh hoặc đổ nước/chất lỏng với mức phí dịch vụ ưu đãi cực kỳ thấp.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ color: '#30b058', mt: 0.5, display: 'flex' }}>
                <IconifyIcon icon="material-symbols:headset-mic" width="28" height="28" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 0.5, color: '#1d1d1f' }}>
                  Hỗ trợ kỹ thuật 24/7 từ chuyên gia
                </Typography>
                <Typography sx={{ color: '#515154', fontSize: '13.5px', lineHeight: 1.5 }}>
                  Được ưu tiên liên hệ trực tiếp với các chuyên gia kỹ thuật của Apple thông qua chat trực tuyến hoặc điện thoại bất cứ lúc nào.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ color: '#f5a623', mt: 0.5, display: 'flex' }}>
                <IconifyIcon icon="material-symbols:battery-charging-full" width="28" height="28" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '15px', mb: 0.5, color: '#1d1d1f' }}>
                  Thay pin chính hãng miễn phí
                </Typography>
                <Typography sx={{ color: '#515154', fontSize: '13.5px', lineHeight: 1.5 }}>
                  Được thay thế pin chính hãng mới hoàn toàn miễn phí nếu dung lượng tối đa của pin giảm xuống dưới 80% so với ban đầu.
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Button
            variant="contained"
            onClick={() => setModalOpen(false)}
            sx={{
              backgroundColor: '#0071e3',
              color: '#ffffff',
              borderRadius: '30px',
              py: 1.2,
              fontWeight: 600,
              fontSize: '14px',
              fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#0062c3',
                boxShadow: 'none',
              },
            }}
          >
            Đã hiểu, đóng hộp thoại
          </Button>
        </Stack>
      </Dialog>
    </Stack>
  );
};

export default SupportPage;
