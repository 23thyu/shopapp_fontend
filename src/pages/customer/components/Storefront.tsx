import { useEffect, useState, useRef, Component, ErrorInfo, ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Spline from '@splinetool/react-spline';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconifyIcon from 'components/base/IconifyIcon';
import { api } from 'services/api';

import IPDeskImg from 'assets/images/IP_Desk_25.png';
import IpadDeskImg from 'assets/images/Ipad_Desk_25.png';
import MacDeskImg from 'assets/images/Mac_Desk_25.png';
import PhukienDeskImg from 'assets/images/Phukien_Desk_25.png';
import SpeakerDeskImg from 'assets/images/Speaker_Desk_25.png';
import WatchDeskImg from 'assets/images/Watch_Desk.png';

/* ── Countdown helper ───────────────────────────── */
const useCountdown = (targetHour = 23, targetMin = 59) => {
  const calc = () => {
    const now = new Date();
    const end = new Date();
    end.setHours(targetHour, targetMin, 59, 0);
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const pad = (n: number) => String(n).padStart(2, '0');

/* ── Banner Carousel ────────────────────────────── */
const BannerCarousel = ({ data }: { data: any[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((p) => (p === 0 ? data.length - 1 : p - 1));
  };
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((p) => (p === data.length - 1 ? 0 : p + 1));
  };

  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(
      () => setActiveIndex((p) => (p === data.length - 1 ? 0 : p + 1)),
      5000,
    );
    return () => clearInterval(id);
  }, [data.length, isHovered]);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 220, sm: 320, md: 460 },
        overflow: 'hidden',
        bgcolor: '#f0f0f0',
        display: 'block',
        '&:hover .banner-arrow': { opacity: 1 },
      }}
    >
      {/* Slides */}
      {data.map((banner, idx) => (
        <Box
          key={banner.id}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: idx === activeIndex ? 1 : 0,
            transition: 'opacity 0.7s ease-in-out',
            pointerEvents: idx === activeIndex ? 'auto' : 'none',
          }}
        >
          <img
            src={banner.image}
            alt={banner.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient at bottom for dots */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 90,
              background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
            }}
          />
        </Box>
      ))}

      {/* Arrows */}
      {[
        { side: 'left' as const, icon: 'material-symbols:arrow-back-ios-new', handler: handlePrev },
        { side: 'right' as const, icon: 'material-symbols:arrow-forward-ios', handler: handleNext },
      ].map(({ side, icon, handler }) => (
        <IconButton
          key={side}
          className="banner-arrow"
          onClick={handler}
          sx={{
            position: 'absolute',
            [side]: { xs: 8, md: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.88)',
            color: '#1d1d1f',
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            zIndex: 10,
            opacity: 0,
            transition: 'opacity 0.25s, background-color 0.2s',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <IconifyIcon icon={icon} fontSize={18} />
        </IconButton>
      ))}

      {/* Dots */}
      <Stack
        direction="row"
        spacing={0.8}
        sx={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        {data.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setActiveIndex(idx)}
            sx={{
              width: idx === activeIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: idx === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

/* ── Flash Sale Section ─────────────────────────── */
const FlashSaleSection = ({ products }: { products: any[] }) => {
  const { h, m, s } = useCountdown(23, 59);
  const scrollRef = useRef<HTMLDivElement>(null);

  const saleProducts = products
    .filter((p) => p.oldprice && p.oldprice > p.price)
    .sort((a, b) => {
      const discA = (a.oldprice - a.price) / a.oldprice;
      const discB = (b.oldprice - b.price) / b.oldprice;
      return discB - discA;
    })
    .slice(0, 10);

  if (saleProducts.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ bgcolor: '#08080a', py: 6, px: { xs: 3, md: 6 }, position: 'relative' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={5}
      >
        {/* Title and Subtitle Block */}
        <Stack spacing={1} sx={{ maxWidth: { xs: '100%', md: '600px' } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ fontSize: '2rem', filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.45))', color: '#ef4444' }}>
              ⚡
            </Box>
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                color: '#fff',
                letterSpacing: '1px',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                textTransform: 'uppercase',
              }}
            >
              FLASH SALE
            </Typography>
          </Stack>
          <Typography sx={{ color: '#71717a', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Mức giá ưu đãi độc quyền trong 24 giờ cho dòng sản phẩm công nghệ tiên tiến nhất thế giới.
            <br />
            Số lượng có hạn, mua ngay kẻo lỡ!
          </Typography>
        </Stack>

        {/* Countdown Block */}
        <Stack direction="column" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={0.5} sx={{ minWidth: 240 }}>
          <Typography sx={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', mb: 0.5 }}>
            KẾT THÚC TRONG
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {[
              { value: pad(h), label: 'GIỜ' },
              { value: pad(m), label: 'PHÚT' },
              { value: pad(s), label: 'GIÂY' },
            ].map((item, idx) => (
              <Stack key={idx} alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    bgcolor: '#18181b',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: { xs: '1.25rem', md: '1.75rem' },
                    px: 1.8,
                    py: 1,
                    borderRadius: 3,
                    minWidth: { xs: 46, md: 60 },
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  {item.value}
                </Box>
                <Typography sx={{ color: '#52525b', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px' }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>

      {/* Scroll arrows */}
      <IconButton
        onClick={() => scroll('left')}
        sx={{
          position: 'absolute',
          left: 12,
          top: '58%',
          transform: 'translateY(-50%)',
          zIndex: 5,
          bgcolor: 'rgba(24, 24, 27, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          width: 44,
          height: 44,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          '&:hover': { bgcolor: 'rgba(39, 39, 42, 0.9)' },
        }}
      >
        <IconifyIcon icon="material-symbols:arrow-back-ios-new" fontSize={18} />
      </IconButton>
      <IconButton
        onClick={() => scroll('right')}
        sx={{
          position: 'absolute',
          right: 12,
          top: '58%',
          transform: 'translateY(-50%)',
          zIndex: 5,
          bgcolor: 'rgba(24, 24, 27, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          width: 44,
          height: 44,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          '&:hover': { bgcolor: 'rgba(39, 39, 42, 0.9)' },
        }}
      >
        <IconifyIcon icon="material-symbols:arrow-forward-ios" fontSize={18} />
      </IconButton>

      {/* Scrollable product list */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2.5,
          overflowX: 'auto',
          pb: 2,
          justifyContent: { xs: 'flex-start', md: saleProducts.length <= 4 ? 'center' : 'flex-start' },
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {saleProducts.map((product) => {
          const disc = Math.round(
            ((product.oldprice - product.price) / product.oldprice) * 100,
          );

          // Generate a stable progress sold percentage based on product id
          const soldPercentage = Math.round((product.id * 17) % 55) + 40; // 40% to 95%

          let stockStatus = 'Còn hàng';
          let statusColor = '#71717a';
          if (soldPercentage >= 85) {
            stockStatus = 'Sắp hết hàng';
            statusColor = '#f43f5e';
          } else if (soldPercentage >= 70) {
            stockStatus = 'Số lượng có hạn';
            statusColor = '#f59e0b';
          } else if (soldPercentage >= 50) {
            stockStatus = 'Bán chạy';
            statusColor = '#f97316';
          }

          return (
            <Box
              key={product.id}
              component={Link}
              href={`/products/${product.id}`}
              sx={{
                flexShrink: 0,
                width: 270,
                bgcolor: '#131316',
                borderRadius: 5,
                overflow: 'hidden',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.04)',
                p: 2.5,
                transition: 'transform 0.25s, box-shadow 0.25s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.08)',
                },
              }}
            >
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Box
                  sx={{
                    bgcolor: '#0c0c0e',
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 180,
                    p: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={product.image || 'https://placehold.co/200x200/png?text=SP'}
                    alt={product.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s',
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: '#dc2626',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    boxShadow: '0 0 10px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  Giảm {disc}%
                </Box>
              </Box>

              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  mb: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {product.name}
              </Typography>

              <Stack direction="column" spacing={0.2} mb={2.5}>
                <Typography
                  sx={{
                    color: '#52525b',
                    textDecoration: 'line-through',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {product.oldprice?.toLocaleString('vi-VN')}đ
                </Typography>
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {product.price?.toLocaleString('vi-VN')}đ
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography sx={{ color: statusColor, fontSize: '0.75rem', fontWeight: 700 }}>
                  {stockStatus}
                </Typography>
                <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800 }}>
                  Đã bán {soldPercentage}%
                </Typography>
              </Stack>
              <Box sx={{ width: '100%', height: 6, bgcolor: '#27272a', borderRadius: 3, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${soldPercentage}%`,
                    height: '100%',
                    bgcolor: '#ef4444',
                    borderRadius: 3,
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

/* ── Category Title Formatter ──────────────────── */
const getCategoryTitle = (name: string) => {
  return name;
};

/* ── Storage Options Helper ────────────────────── */
const getStorageOptions = (attributes: any): string[] => {
  if (!attributes) return [];
  try {
    const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    if (!Array.isArray(attrs)) return [];
    const storageAttr = attrs.find((attr: any) => /dung lượng|bộ nhớ|storage|ram|rom/i.test(attr.name));
    if (storageAttr) {
      if (Array.isArray(storageAttr.values)) {
        return storageAttr.values;
      }
      if (storageAttr.rawInput) {
        return storageAttr.rawInput.split(',').map((s: string) => s.trim());
      }
    }
  } catch (e) {
    console.error('Error parsing attributes for storage options:', e);
  }
  return [];
};

/* ── Color Options Helpers ─────────────────────── */
const getColorOptions = (attributes: any): string[] => {
  if (!attributes) return [];
  try {
    const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    if (!Array.isArray(attrs)) return [];
    const colorAttr = attrs.find((attr: any) => /màu sắc|color/i.test(attr.name));
    if (colorAttr) {
      if (Array.isArray(colorAttr.values)) {
        return colorAttr.values;
      }
      if (colorAttr.rawInput) {
        return colorAttr.rawInput.split(',').map((s: string) => s.trim());
      }
    }
  } catch (e) {
    console.error('Error parsing attributes for color options:', e);
  }
  return [];
};

const getColorHex = (name: string): string => {
  const n = name.trim().toLowerCase();

  if (n.includes('bạc') || n.includes('silver')) return '#e3e4e5';
  if (n.includes('titan sa mạc') || n.includes('desert')) return '#c3b299';
  if (n.includes('titan tự nhiên') || n.includes('natural')) return '#a6a19a';
  if (n.includes('titan trắng') || n.includes('white titanium')) return '#fafafa';
  if (n.includes('titan đen') || n.includes('black titanium')) return '#252526';
  if (n.includes('đen') || n.includes('black') || n.includes('gray') || n.includes('xám')) return '#1c1d21';
  if (n.includes('trắng') || n.includes('white')) return '#fafafa';
  if (n.includes('vàng hồng') || n.includes('rose gold')) return '#fad4c0';
  if (n.includes('vàng') || n.includes('gold')) return '#f2d1a3';
  if (n.includes('cam')) return '#e85d34';
  if (n.includes('hồng') || n.includes('pink')) return '#ffd3d1';
  if (n.includes('xanh lá') || n.includes('green') || n.includes('xanh lục')) return '#b4d9b6';
  if (n.includes('xanh đậm') || n.includes('deep blue')) return '#1c304a';
  if (n.includes('xanh dương') || n.includes('blue') || n.includes('xanh')) return '#a7c1d9';
  if (n.includes('đỏ') || n.includes('red')) return '#d11a2a';

  return '#cccccc';
};

/* ── Category Products List ───────────────────── */
const CategoryProductsList = ({ category, products }: { category: any; products: any[] }) => {
  // Sort newest first: prefer created_at DESC, fallback to id DESC
  const sortedProducts = [...products].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return (b.id ?? 0) - (a.id ?? 0);
  });

  // Take only top 4 products
  const displayProducts = sortedProducts.slice(0, 4);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Category header */}
      <Typography
        variant="h3"
        sx={{
          textAlign: 'center',
          fontWeight: 600,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          color: '#1d1d1f',
          mb: 4,
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          letterSpacing: '-0.5px',
        }}
      >
        {getCategoryTitle(category.name)}
      </Typography>

      {/* Grid containing exactly 4 products */}
      <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        {displayProducts.map((product) => {
          const hasDiscount = product.oldprice != null && Number(product.oldprice) > Number(product.price);
          const disc = hasDiscount
            ? Math.round(((Number(product.oldprice) - Number(product.price)) / Number(product.oldprice)) * 100)
            : 0;

          const storages = getStorageOptions(product.attributes);
          const colors = getColorOptions(product.attributes);

          return (
            <Grid item key={product.id} xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
              <Box
                component="a"
                href={`/products/${product.id}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: '#f4f5f8', // Light grey background
                  borderRadius: '28px',
                  p: '30px', // Exact 30px padding
                  textDecoration: 'none',
                  color: '#1d1d1f',
                  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
                  width: '100%',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                  },
                }}
              >
                {/* Product image directly on background */}
                <Box
                  component="img"
                  src={product.image || 'https://placehold.co/300x300/f4f5f8/888?text=SP'}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: { xs: 200, sm: 220, md: 240 },
                    objectFit: 'contain',
                    mb: 2.5,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />

                {/* Storage options badges */}
                {storages.length > 0 && (
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: 'wrap', gap: '6px' }}>
                    {storages.map((s) => (
                      <Box
                        key={s}
                        sx={{
                          bgcolor: '#ffffff',
                          border: '1px solid rgba(0,0,0,0.08)',
                          color: '#1d1d1f',
                          px: 1.2,
                          py: 0.5,
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                        }}
                      >
                        {s}
                      </Box>
                    ))}
                  </Stack>
                )}

                {/* Color swatches */}
                {colors.length > 0 && (
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: 'wrap', gap: '6px' }}>
                    {colors.map((c) => (
                      <Box
                        key={c}
                        title={c}
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: getColorHex(c),
                          border: '1px solid rgba(0,0,0,0.15)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}
                      />
                    ))}
                  </Stack>
                )}

                {/* Product Name */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#1d1d1f',
                    fontWeight: 500,
                    fontSize: '0.92rem',
                    mb: 1.5,
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    minHeight: '2.8em',
                  }}
                >
                  {product.name}
                </Typography>

                {/* Price and discount in one line */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 'auto', width: '100%' }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#000000',
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    {Number(product.price).toLocaleString('vi-VN')}đ
                  </Typography>

                  {hasDiscount && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#86868b',
                          textDecoration: 'line-through',
                          fontSize: '0.85rem',
                        }}
                      >
                        {Number(product.oldprice).toLocaleString('vi-VN')}đ
                      </Typography>
                      {disc > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#86868b',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                          }}
                        >
                          -{disc}%
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

/* ── Product Card ───────────────────────────────── */
const ProductCard = ({ product }: { product: any }) => {
  const hasDiscount = Boolean(product.oldprice && product.oldprice > product.price);
  const disc = hasDiscount
    ? Math.round(((product.oldprice - product.price) / product.oldprice) * 100)
    : 0;
  const outOfStock =
    product.quantity !== null && product.quantity !== undefined && product.quantity <= 0;

  const storages = getStorageOptions(product.attributes);
  const colors = getColorOptions(product.attributes);

  return (
    <Box
      component={Link}
      href={`/products/${product.id}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: '#f4f5f8', // Light grey background
        borderRadius: '28px',
        p: '30px', // Exact 30px padding
        textDecoration: 'none',
        color: '#1d1d1f',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        width: '100%',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.06)',
          '& img': { transform: 'scale(1.05)' },
        },
      }}
    >
      <Box sx={{ position: 'relative', bgcolor: 'transparent', overflow: 'hidden', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box
          component="img"
          src={product.image || 'https://placehold.co/400x400/png?text=SP'}
          alt={product.name}
          sx={{
            width: '100%',
            height: { xs: 200, sm: 220, md: 240 },
            objectFit: 'contain',
            mb: 2.5,
            transition: 'transform 0.45s ease',
          }}
        />
        {outOfStock && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '20px',
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: '#1d1d1f', letterSpacing: 1, textTransform: 'uppercase' }}
            >
              Hàng sắp về
            </Typography>
          </Box>
        )}
      </Box>

      {/* Storage options badges */}
      {storages.length > 0 && (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: 'wrap', gap: '6px' }}>
          {storages.map((s) => (
            <Box
              key={s}
              sx={{
                bgcolor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#1d1d1f',
                px: 1.2,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 500,
              }}
            >
              {s}
            </Box>
          ))}
        </Stack>
      )}

      {/* Color swatches */}
      {colors.length > 0 && (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: 'wrap', gap: '6px' }}>
          {colors.map((c) => (
            <Box
              key={c}
              title={c}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: getColorHex(c),
                border: '1px solid rgba(0,0,0,0.15)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </Stack>
      )}

      {/* Info area */}
      <Typography
        variant="body1"
        fontWeight={500}
        sx={{
          color: '#1d1d1f',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
          fontSize: '0.92rem',
          minHeight: '2.8em',
          textAlign: 'center',
          mb: 1.5,
          width: '100%',
        }}
      >
        {product.name}
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} flexWrap="wrap" mt="auto" width="100%">
        <Typography variant="body1" fontWeight={700} sx={{ color: '#000000', fontSize: '1rem' }}>
          {product.price?.toLocaleString('vi-VN')}đ
        </Typography>
        {hasDiscount && (
          <>
            <Typography
              variant="caption"
              sx={{ color: '#86868b', textDecoration: 'line-through', fontSize: '0.85rem' }}
            >
              {product.oldprice?.toLocaleString('vi-VN')}đ
            </Typography>
            {disc > 0 && (
              <Typography
                variant="caption"
                sx={{ color: '#86868b', fontWeight: 500, fontSize: '0.85rem' }}
              >
                -{disc}%
              </Typography>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};


/* ── Apple-style Banners components ──────────────── */
const AppleHeroDark = () => {
  return (
    <Box
      sx={{
        bgcolor: '#000000',
        color: '#ffffff',
        width: '100%',
        height: { xs: '540px', sm: '620px', md: '692px' },
        overflow: 'hidden',
        borderBottom: '12px solid #ffffff',
        position: 'relative',
      }}
    >
      {/* Background Image */}
      <Box
        component="img"
        src="/banners/macbook_dark.jpg"
        alt="MacBook Pro Space Black"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 1,
          transition: 'transform 0.4s ease',
          '&:hover': {
            transform: 'scale(1.01)',
          },
        }}
      />

      {/* Slogan Text Overlay (Bottom Left) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: '120px', sm: '40px', md: '48px' },
          left: { xs: '20px', sm: '40px', md: '48px' },
          right: { xs: '20px', sm: 'auto' },
          textAlign: { xs: 'center', sm: 'left' },
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.8,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#ffffff',
          }}
        >
          MacBook Pro
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
            letterSpacing: '-1px',
            lineHeight: 1.15,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#ffffff',
          }}
        >
          Tốc độ trong bộ gen.
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 500,
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mt: 0.5,
          }}
        >
          Nay với M5, M5 Pro và M5 Max.
        </Typography>
      </Box>

      {/* Pricing Capsule (Bottom Right) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: '24px', sm: '40px', md: '48px' },
          left: { xs: '20px', sm: 'auto' },
          right: { xs: '20px', sm: '40px', md: '48px' },
          zIndex: 2,
          bgcolor: 'rgba(28, 28, 30, 0.75)',
          borderRadius: '30px',
          px: { xs: 2.5, sm: 3 },
          py: { xs: 1.2, sm: 1.4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 3.5 },
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Stack direction="column" spacing={0.2} sx={{ textAlign: 'left' }}>
          <Typography
            sx={{
              fontSize: { xs: '13px', sm: '14px' },
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            Từ 54.999.000đ
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '10px', sm: '11px' },
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            hoặc 2.239.000đ/th. trong 24 tháng.*
          </Typography>
        </Stack>
        <Button
          component={Link}
          href="/?q=MacBook"
          variant="contained"
          sx={{
            bgcolor: '#0071e3',
            color: '#ffffff',
            borderRadius: '20px',
            px: 2.8,
            py: 0.6,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: 'none',
            minWidth: 'auto',
            '&:hover': {
              bgcolor: '#0077ed',
              boxShadow: 'none',
            },
          }}
        >
          Mua
        </Button>
      </Box>
    </Box>
  );
};

const AppleGridCard = ({
  title,
  subtitle,
  titleComponent,
  isDark,
  image,
  linkUrl,
  textPosition = 'top',
  imageStyle = {},
}: {
  title?: string;
  subtitle: string;
  titleComponent?: React.ReactNode;
  isDark: boolean;
  image: string;
  linkUrl: string;
  textPosition?: 'top' | 'bottom';
  imageStyle?: any;
}) => {
  return (
    <Box
      sx={{
        bgcolor: isDark ? '#000000' : '#f5f5f7',
        color: isDark ? '#ffffff' : '#1d1d1f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: { xs: '450px', sm: '520px', md: '580px' },
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Background/Foreground image depending on textPosition */}
      <Box
        component="img"
        src={image}
        alt={title || "product"}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          width: '100%',
          ...(textPosition === 'bottom'
            ? {
              top: 0,
              bottom: 0,
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }
            : {
              bottom: 0,
              height: '75%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
            }),
          zIndex: 1,
          transition: 'transform 0.4s ease',
          '&:hover': {
            transform: 'scale(1.02)',
          },
          ...imageStyle,
        }}
      />

      {/* Overlay Text Container */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 3,
          ...(textPosition === 'bottom'
            ? {
              bottom: '40px',
            }
            : {
              top: '40px',
            }),
        }}
      >
        {titleComponent ? (
          titleComponent
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.5px',
              color: isDark ? '#ffffff' : '#1d1d1f',
            }}
          >
            {title}
          </Typography>
        )}
        <Typography
          variant="body1"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : '#86868b',
            fontSize: { xs: '0.95rem', sm: '1.1rem' },
            mt: 1.2,
            mb: 0.5,
            maxWidth: '320px',
            lineHeight: 1.4,
            fontWeight: 500,
            whiteSpace: 'pre-line',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {subtitle}
        </Typography>

        {/* Buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2.2 }}>
          <Button
            component={Link}
            href={linkUrl}
            variant="contained"
            sx={{
              bgcolor: isDark ? '#ffffff' : '#0071e3',
              color: isDark ? '#1d1d1f' : '#ffffff',
              borderRadius: '30px',
              px: 2.8,
              py: 0.7,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: isDark ? '#f5f5f7' : '#0077ed',
                boxShadow: 'none',
              },
            }}
          >
            Tìm hiểu thêm
          </Button>
          <Button
            component={Link}
            href={linkUrl}
            variant="outlined"
            sx={{
              borderColor: isDark ? '#ffffff' : '#0071e3',
              color: isDark ? '#ffffff' : '#0071e3',
              borderRadius: '30px',
              px: 2.8,
              py: 0.7,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 600,
              borderWidth: '1px',
              '&:hover': {
                borderColor: isDark ? '#ffffff' : '#0071e3',
                borderWidth: '1px',
                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,113,227,0.08)',
              },
            }}
          >
            Mua
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

const AppleBanners = () => {
  return (
    <Box sx={{ width: '100%', bgcolor: '#ffffff' }}>

      {/* 2. MacBook Pro Hero Dark */}
      <AppleHeroDark />

      {/* 3. Grid of Banners */}
      <Grid container spacing={1.5} sx={{ bgcolor: '#ffffff', p: 1.5, width: '100%', mx: 0 }}>
        <Grid item xs={12} md={6}>
          <AppleGridCard
            title="iPad Pro"
            subtitle={"Hiệu năng AI tiên tiến và năng\nlực thay đổi cuộc chơi."}
            isDark={true}
            image="/banners/ipad_front.jpg"
            linkUrl="/?q=iPad"
            textPosition="top"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AppleGridCard
            title="AirPods Pro 3"
            subtitle={"Chủ Động Khử Tiếng Ồn\ntai bạn chưa từng nghe."}
            isDark={true}
            image="/banners/airpods_lifestyle.jpg"
            linkUrl="/?q=AirPods"
            textPosition="bottom"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AppleGridCard
            title="AirPods Pro"
            subtitle="Âm thanh thích ứng. Chủ động khử tiếng ồn."
            isDark={false}
            image="/banners/airpods_front.jpg"
            linkUrl="/?q=AirPods"
            textPosition="top"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AppleGridCard
            titleComponent={
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                <IconifyIcon icon="mdi:apple" fontSize={26} style={{ color: '#1d1d1f' }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  WATCH
                </Typography>
              </Stack>
            }
            subtitle="Mỏng hơn. Nhiều điều để yêu hơn."
            isDark={false}
            image="/banners/apple_watch_side.jpg"
            linkUrl="/?q=Watch"
            textPosition="top"
          />
        </Grid>
      </Grid>
    </Box>
  );
};


/* ── Spline Error Boundary ──────────────────────── */
class SplineErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  public state = { hasError: false };

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Spline error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/* ── ThreeDBanner Showcase ─────────────────────── */
const ThreeDBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Detect WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setWebglSupported(supported);
      if (!supported) {
        setIsLoaded(true); // Don't block loading indicator if not supported
      }
    } catch (e) {
      setWebglSupported(false);
      setIsLoaded(true);
    }
  }, []);

  // 1. Optimize scroll: freeze rendering when out of viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Prevent Spline from capturing wheel/scroll events so page scroll is not hijacked
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Stop event from propagating to the canvas element inside, allowing browser scroll to trigger normally
      e.stopPropagation();
    };

    container.addEventListener('wheel', handleWheel, { capture: true });
    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

  const fallbackView = (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, #2a2a2a 0%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1200&auto=format&fit=crop"
        alt="Phone Showcase"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.3,
          mixBlendMode: 'luminosity',
        }}
      />
    </Box>
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: { xs: 400, sm: 500, md: 600 },
        bgcolor: '#000000',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'radial-gradient(circle, rgba(70,70,70,0.18) 0%, rgba(0,0,0,1) 80%)',
        cursor: webglSupported ? 'grab' : 'default',
      }}
    >
      {/* 3D Scene / Fallback */}
      {webglSupported ? (
        <SplineErrorBoundary fallback={fallbackView}>
          <Box
            sx={{
              width: 'calc(100% + 300px)', // Crop right-side watermark (pushed by 150px)
              height: 'calc(100% + 120px)', // Crop bottom-side watermark (pushed by 60px)
              position: 'absolute',
              top: -60, // Shift up by 60px to maintain perfect vertical center
              left: -150, // Shift left by 150px to maintain perfect horizontal center
              display: isInView ? 'block' : 'none', // Stop WebGL loop when out of viewport
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.6s ease-in-out',
              pointerEvents: 'auto', // Enable direct drag/rotation interaction
            }}
          >
            <Spline
              scene="https://prod.spline.design/HRlkBm4iGVIWKdg6/scene.splinecode"
              onLoad={(splineApp: any) => {
                // OPTIMIZATION: Limit pixel ratio to 1 (standard definition) to save 70% GPU load on Retina/4K displays
                try {
                  if (splineApp) {
                    if (typeof splineApp.setPixelRatio === 'function') {
                      splineApp.setPixelRatio(1);
                    } else if (splineApp.renderer && typeof splineApp.renderer.setPixelRatio === 'function') {
                      splineApp.renderer.setPixelRatio(1);
                    } else if (splineApp._renderer && typeof splineApp._renderer.setPixelRatio === 'function') {
                      splineApp._renderer.setPixelRatio(1);
                    }
                  }
                } catch (e) {
                  console.warn('Spline pixel ratio opt skipped:', e);
                }
                setIsLoaded(true);
              }}
            />
          </Box>
        </SplineErrorBoundary>
      ) : (
        fallbackView
      )}

      {/* Loading Indicator */}
      {!isLoaded && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <CircularProgress sx={{ color: '#E57335' }} size={40} />
        </Box>
      )}

      {/* Top Title Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 20, sm: 30, md: 40 },
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3.2rem' },
            fontWeight: 600,
            letterSpacing: '-0.5px',
            lineHeight: 1,
            textTransform: 'none',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
          }}
        >
          iPhone 17
        </Typography>
        <Typography
          variant="h1"
          fontWeight={900}
          sx={{
            background: 'linear-gradient(180deg, #F88A41 0%, #C35116 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '4.5rem', sm: '7.5rem', md: '10.5rem' },
            letterSpacing: '-2px',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
            mt: { xs: -0.5, sm: -1, md: -1.5 },
          }}
        >
          PRO
        </Typography>
      </Box>

      {/* Bottom Actions Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 30, sm: 40, md: 50 },
          left: 0,
          right: 0,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.8,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = '/?category_name=iPhone';
          }}
          sx={{
            bgcolor: '#0071e3',
            color: '#fff',
            fontWeight: 600,
            fontSize: { xs: '0.88rem', sm: '0.95rem' },
            px: { xs: 4, sm: 5 },
            py: { xs: 1.2, sm: 1.4 },
            borderRadius: 30,
            textTransform: 'none',
            '&:hover': { bgcolor: '#0077ed' },
            boxShadow: 'none',
            pointerEvents: 'auto',
          }}
        >
          Tìm hiểu ngay
        </Button>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: '#e8e8ed',
            fontSize: { xs: '0.8rem', sm: '0.92rem' },
            letterSpacing: '-0.1px',
            fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Từ 34.999.000đ hoặc 1.425.000đ/th. trong 24 tháng.*
        </Typography>
      </Box>
    </Box>
  );
};

/* ── Series Filters Mapping ────────────────────── */
const SERIES_FILTERS: Record<string, string[]> = {
  'iphone': [
    'iPhone 17 Series',
    'iPhone Air Series',
    'iPhone 16 Series',
    'iPhone 15 Series',
    'iPhone 14 Series',
    'iPhone 13 Series'
  ],
  'mac': [
    'MacBook Pro',
    'MacBook Air',
    'iMac',
    'Mac mini',
    'Mac Studio',
    'Mac Pro'
  ],
  'ipad': [
    'iPad Pro',
    'iPad Air',
    'iPad',
    'iPad mini'
  ],
  'watch': [
    'Apple Watch Ultra',
    'Apple Watch Series',
    'Apple Watch SE'
  ],
  'tai nghe, loa': [
    'AirPods Pro',
    'AirPods Max',
    'AirPods',
    'HomePod',
    'HomePod mini'
  ]
};

const matchSeries = (productName: string, seriesName: string): boolean => {
  const normProduct = productName.toLowerCase();
  const normSeries = seriesName.toLowerCase().replace(/\s+series$/, '');

  if (normSeries === 'iphone air') {
    return normProduct.includes('iphone air') || normProduct.includes('iphone slim');
  }
  return normProduct.includes(normSeries);
};

/* ── HomeCategories Section ────────────────────── */
const HomeCategories = () => {
  const categoriesList = [
    { name: 'iPhone', query: 'iPhone', image: IPDeskImg },
    { name: 'Mac', query: 'Mac', image: MacDeskImg },
    { name: 'iPad', query: 'iPad', image: IpadDeskImg },
    { name: 'Watch', query: 'Watch', image: WatchDeskImg },
    { name: 'Tai nghe, loa', query: 'Tai nghe, Loa', image: SpeakerDeskImg },
    { name: 'Phụ kiện', query: 'Phụ kiện', image: PhukienDeskImg },
  ];

  return (
    <Box sx={{ bgcolor: '#18181c', py: 6, px: { xs: 3, md: 6 } }}>
      {/* Title Row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          mb: 5,
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Cửa Hàng
        </Typography>

        <Stack direction="column" alignItems="flex-start" spacing={1} sx={{ mt: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.3,
              maxWidth: '320px'
            }}
          >
            Cách tốt nhất để mua sản phẩm bạn thích.
          </Typography>
          <Link
            href="/news-list"
            sx={{
              color: '#2997ff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Kết Nối Với Chuyên Gia <span style={{ marginLeft: '4px', fontSize: '11px' }}>↗</span>
          </Link>
        </Stack>
      </Stack>

      {/* Categories Grid/Row */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{
          flexWrap: 'wrap',
          gap: '20px',
          maxWidth: '1200px',
          mx: 'auto'
        }}
      >
        {categoriesList.map((cat) => (
          <Box
            key={cat.name}
            component="a"
            href={`/?category_name=${encodeURIComponent(cat.query)}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#323232',
              borderRadius: '24px',
              width: 180,
              height: 220,
              p: 2.5,
              textDecoration: 'none',
              transition: 'transform 0.25s ease-in-out, background-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'translateY(-6px)',
                bgcolor: '#3d3d3d',
                boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              }
            }}
          >
            <Box
              component="img"
              src={cat.image}
              alt={cat.name}
              sx={{
                width: '100%',
                height: 110,
                objectFit: 'contain',
                mb: 2.5,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                textAlign: 'center',
                letterSpacing: '-0.01em'
              }}
            >
              {cat.name}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

/* ── Storefront ─────────────────────────────────── */
const Storefront = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for sub-filtering and sorting
  const [selectedSeries, setSelectedSeries] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Read filters from URL search params (set by CustomerHeader)
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q') || '';
  const selectedCategoryName = params.get('category_name') || '';
  const selectedBrandName = params.get('brand_name') || '';

  // Reset selected sub-filter when active category changes
  useEffect(() => {
    setSelectedSeries('');
  }, [selectedCategoryName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          api.getProducts('all').catch(() => ({ data: [] })),
          api.getCategories('all').catch(() => ({ data: [] })),
          api.getBrands().catch(() => ({ data: [] })),
        ]);
        const fetchedProducts = Array.isArray(prodRes) ? prodRes : (prodRes?.data || []);
        const fetchedCategories = Array.isArray(catRes) ? catRes : (catRes?.data || []);

        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setBrands(Array.isArray(brandRes) ? brandRes : (brandRes?.data || []));

        let bannerData: any = [];
        try {
          const bannerRes = await api.getBanners('all');
          bannerData = Array.isArray(bannerRes) ? bannerRes : (bannerRes?.data || []);
        } catch (err) {
          console.error('Lỗi fetch banner:', err);
        }

        let filteredBanners = bannerData.filter((b: any) => b.status === 1);
        if (filteredBanners.length === 0) filteredBanners = bannerData;
        setBanners(filteredBanners);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryName === '' ||
      categories
        .find((c: any) => c.id === product.category_id)
        ?.name?.toLowerCase() === selectedCategoryName.toLowerCase();
    const matchesBrand =
      selectedBrandName === '' ||
      brands
        .find((b: any) => b.id === product.brand_id)
        ?.name?.toLowerCase() === selectedBrandName.toLowerCase();
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const displayProducts = filteredProducts
    .filter((product) => {
      if (!selectedSeries) return true;
      return matchSeries(product.name, selectedSeries);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return (b.id ?? 0) - (a.id ?? 0);
      }
      if (sortBy === 'price_asc') {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === 'price_desc') {
        return Number(b.price) - Number(a.price);
      }
      if (sortBy === 'discount') {
        const discA = a.oldprice ? (a.oldprice - a.price) / a.oldprice : 0;
        const discB = b.oldprice ? (b.oldprice - b.price) / b.oldprice : 0;
        return discB - discA;
      }
      return (b.buyturn ?? 0) - (a.buyturn ?? 0);
    });

  if (loading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  const isFiltering =
    searchQuery.trim() !== '' || selectedCategoryName !== '' || selectedBrandName !== '';

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        bgcolor: '#ffffff',
        minHeight: '100vh',
      }}
    >
      {/* ── Banner: full width, no padding ── */}
      {!isFiltering && (
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <ThreeDBanner />
        </Box>
      )}

      {/* ── Flash Sale: full width ── */}
      {!isFiltering && (
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <FlashSaleSection products={products} />
        </Box>
      )}

      {/* ── Home Page Categories Section ── */}
      {!isFiltering && (
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <HomeCategories />
        </Box>
      )}

      {/* ── Products: always below banner ── */}
      {isFiltering ? (
        <Box id="products-section" sx={{ bgcolor: '#ffffff', py: 4, px: { xs: 2, md: 4 }, width: '100%' }}>
          {/* Search results */}
          <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
            {/* Series Filter Bar */}
            {selectedCategoryName && SERIES_FILTERS[selectedCategoryName.toLowerCase()] && (
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: '8px', mb: 1.2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedSeries('')}
                  startIcon={<IconifyIcon icon="material-symbols:filter-list" />}
                  sx={{
                    borderRadius: '6px',
                    borderColor: 'rgba(0,0,0,0.15)',
                    color: '#1d1d1f',
                    textTransform: 'none',
                    px: '13px',
                    height: '32px',
                    fontSize: '14px',
                    minWidth: 'auto',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.03)',
                      borderColor: 'rgba(0,0,0,0.25)',
                    }
                  }}
                >
                  Lọc
                </Button>
                {SERIES_FILTERS[selectedCategoryName.toLowerCase()].map((series) => {
                  const isActive = selectedSeries === series;
                  return (
                    <Button
                      key={series}
                      variant={isActive ? 'contained' : 'text'}
                      onClick={() => setSelectedSeries(isActive ? '' : series)}
                      sx={{
                        borderRadius: '6px',
                        bgcolor: isActive ? '#1d1d1f' : '#f4f5f8',
                        color: isActive ? '#ffffff' : '#1d1d1f',
                        textTransform: 'none',
                        px: '13px',
                        height: '32px',
                        fontSize: '14px',
                        minWidth: 'auto',
                        fontWeight: isActive ? 600 : 400,
                        '&:hover': {
                          bgcolor: isActive ? '#333333' : 'rgba(0,0,0,0.05)',
                        }
                      }}
                    >
                      {series}
                    </Button>
                  );
                })}
              </Stack>
            )}

            {/* Sort Options Bar */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: '10px', mb: '32px', flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#86868b', fontWeight: 500, mr: 1, fontSize: '14px' }}>
                Sắp xếp theo:
              </Typography>
              {[
                { label: 'Nổi bật', value: 'popular' },
                { label: 'Bán chạy', value: 'sales' },
                { label: 'Giảm giá', value: 'discount' },
                { label: 'Mới', value: 'newest' },
                { label: sortBy === 'price_asc' ? 'Giá ˄' : 'Giá ˅', value: 'price' }
              ].map((opt, idx, arr) => {
                const isPrice = opt.value === 'price';
                const isActive = isPrice
                  ? sortBy.startsWith('price')
                  : (opt.value === 'sales' ? sortBy === 'popular' || sortBy === 'sales' : sortBy === opt.value);

                return (
                  <Stack key={opt.label} direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body2"
                      onClick={() => {
                        if (isPrice) {
                          setSortBy(sortBy === 'price_asc' ? 'price_desc' : 'price_asc');
                        } else {
                          setSortBy(opt.value);
                        }
                      }}
                      sx={{
                        color: isActive ? '#1d1d1f' : '#86868b',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#1d1d1f' },
                        fontSize: '14px'
                      }}
                    >
                      {opt.label}
                    </Typography>
                    {idx < arr.length - 1 && (
                      <Typography variant="body2" sx={{ color: '#86868b', fontSize: '14px' }}>
                        •
                      </Typography>
                    )}
                  </Stack>
                );
              })}
            </Stack>

            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
              {displayProducts.map((p) => (
                <Grid key={p.id} item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                  <ProductCard product={p} />
                </Grid>
              ))}
              {displayProducts.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Không tìm thấy sản phẩm phù hợp
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Stack>
        </Box>
      ) : (
        /* Apple-style banners replacing default category product lists */
        <Box sx={{ width: '100%' }}>
          <AppleBanners />
        </Box>
      )}
    </Box>
  );
};

export default Storefront;
