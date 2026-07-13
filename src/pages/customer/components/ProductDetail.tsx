import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { api } from 'services/api';
import IconifyIcon from 'components/base/IconifyIcon';

/* ─── helpers ────────────────────────────────────────────────── */
const parseAttrs = (attrs: any): Record<string, string> => {
  if (!attrs) return {};
  try { return typeof attrs === 'string' ? JSON.parse(attrs) : attrs; }
  catch { return {}; }
};
const fmtVND = (n?: number | null) =>
  n != null ? n.toLocaleString('vi-VN') + 'đ' : '';

// Map Vietnamese color names to CSS colors
const colorMap: Record<string, string> = {
  'đen': '#1a1a1c',
  'black': '#1a1a1c',
  'trắng': '#f5f5f7',
  'white': '#f5f5f7',
  'bạc': '#e3e4e5',
  'silver': '#e3e4e5',
  'xám': '#535456',
  'gray': '#535456',
  'grey': '#535456',
  'vàng': '#f9e4c9',
  'gold': '#f9e4c9',
  'vàng nhạt': '#f9e4c9',
  'vàng hồng': '#e8d2ca',
  'rose gold': '#e8d2ca',
  'xanh': '#2f4452',
  'blue': '#2f4452',
  'xanh dương': '#2f4452',
  'xanh lá': '#354e3b',
  'green': '#354e3b',
  'xanh đậm': '#1f2e3d',
  'cam vũ trụ': '#c86a4b',
  'cam': '#c86a4b',
  'orange': '#c86a4b',
  'đỏ': '#b72229',
  'red': '#b72229',
  'hồng': '#fae0e4',
  'pink': '#fae0e4',
  'tím': '#3c354e',
  'purple': '#3c354e',
};

const getColorCSS = (colorName: string): string => {
  const norm = colorName.toLowerCase().trim();
  if (colorMap[norm]) return colorMap[norm];
  for (const [k, v] of Object.entries(colorMap)) {
    if (norm.includes(k)) return v;
  }
  return '#7f8c8d';
};

/* ─── Gallery ─────────────────────────────────────────────────── */
const Gallery = ({
  images, active, onSelect,
}: {
  images: { id: string | number; url: string }[];
  active: string;
  onSelect: (url: string) => void;
}) => {
  const idx = images.findIndex(img => img.url === active);
  const prev = () => onSelect(images[idx <= 0 ? images.length - 1 : idx - 1].url);
  const next = () => onSelect(images[idx >= images.length - 1 ? 0 : idx + 1].url);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Main image */}
      <div style={{
        position: 'relative',
        background: '#232325',
        borderRadius: 16,
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,.05)',
      }}>
        <img
          src={active || 'https://placehold.co/600x600/2a2a2e/888?text=No+Image'}
          alt="product"
          style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', transition: 'all .25s' }}
        />
        {images.length > 1 && (
          <>
            <ArrowBtn dir="left" onClick={prev} />
            <ArrowBtn dir="right" onClick={next} />
            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {images.map((_, i) => (
                <div key={i} onClick={() => onSelect(images[i].url)} style={{
                  width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === idx ? '#E02020' : 'rgba(255,255,255,.3)',
                  cursor: 'pointer', transition: 'all .25s',
                }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
          {images.map(img => (
            <div
              key={img.id}
              onClick={() => onSelect(img.url)}
              style={{
                flexShrink: 0, width: 68, height: 68, borderRadius: 8,
                border: active === img.url ? '2px solid #E02020' : '1px solid rgba(255,255,255,.1)',
                background: '#232325', cursor: 'pointer', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6,
                transition: 'all .2s',
              }}
            >
              <img src={img.url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ArrowBtn = ({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) => (
  <IconButton
    onClick={onClick}
    size="small"
    sx={{
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      [dir]: 16,
      bgcolor: 'rgba(30,30,32,.8)', color: '#fff',
      border: '1px solid rgba(255,255,255,.1)',
      '&:hover': { bgcolor: 'rgba(50,50,52,.95)' },
      zIndex: 2,
    }}
  >
    <IconifyIcon
      icon={dir === 'left' ? 'material-symbols:arrow-back-ios-new' : 'material-symbols:arrow-forward-ios'}
      fontSize={15}
    />
  </IconButton>
);

/* ─── Storage Pill ────────────────────────────────────────────── */
const StoragePill = ({ label, selected, disabled, onClick }: { label: string; selected: boolean; disabled: boolean; onClick: () => void }) => (
  <button
    onClick={disabled ? undefined : onClick}
    style={{
      padding: '10px 20px',
      borderRadius: 8,
      border: selected ? '2px solid #E02020' : '1px solid rgba(255,255,255,.15)',
      background: selected ? 'rgba(224,32,32,.08)' : 'rgba(255,255,255,.03)',
      color: selected ? '#fff' : '#ccc',
      fontWeight: selected ? 700 : 500,
      fontSize: 13,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      transition: 'all .15s',
      fontFamily: 'inherit',
    }}
  >
    {label}
  </button>
);

/* ─── Color Circle Dot ────────────────────────────────────────── */
const ColorDot = ({ colorName, selected, onClick }: { colorName: string; selected: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    title={colorName}
    style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      backgroundColor: getColorCSS(colorName),
      border: selected ? '2px solid #1d1d1f' : '2px solid transparent',
      boxShadow: selected ? '0 0 0 2.5px #1565C0' : '0 0 0 1px rgba(255,255,255,.2)',
      cursor: 'pointer',
      transition: 'all .18s',
    }}
  />
);

/* ─── Tab Panel ───────────────────────────────────────────────── */
const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
  <div role="tabpanel" hidden={value !== index} style={{ paddingTop: 32 }}>
    {value === index && children}
  </div>
);

/* ─── Spec accordion group ─────────────────────────────────────── */
const SpecGroup = ({ title, rows }: { title: string; rows: { k: string; v: string }[] }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,.04)', cursor: 'pointer' }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{title}</span>
        <IconifyIcon icon={open ? 'mdi:minus' : 'mdi:plus'} style={{ color: '#aaa', fontSize: 18 }} />
      </div>
      {open && rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,.05)', background: i % 2 ? 'rgba(255,255,255,.01)' : 'transparent' }}>
          <span style={{ color: '#888', fontSize: 13, width: '38%', flexShrink: 0 }}>{row.k}</span>
          <span style={{ color: '#eee', fontSize: 13 }}>{row.v}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Info row ─────────────────────────────────────────────────── */
const InfoRow = ({ icon, text }: { icon: string; text: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
    <IconifyIcon icon={icon} style={{ color: '#FFD700', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
    <span style={{ color: '#bbb', fontSize: 13, lineHeight: 1.5 }}>{text}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [extraImages, setExtraImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Custom states for grouped variants
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState('');
  const [cartFlash, setCartFlash] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const prod = await api.getProductById(Number(id));
        const p = prod?.data || prod;
        setProduct(p);
        setActiveImg(p.image || '');

        const [vRes, iRes] = await Promise.all([
          api.getVariants(Number(id)).catch(() => []),
          api.getProductImages(Number(id)).catch(() => []),
        ]);
        const vs = Array.isArray(vRes) ? vRes : (vRes?.data || []);
        setVariants(vs);

        if (vs.length) {
          const firstV = vs[0];
          setSelectedVariant(firstV);
          if (firstV.image) {
            setActiveImg(firstV.image);
          }

          const attrs = parseAttrs(
            firstV.details?.length
              ? Object.fromEntries(firstV.details.map((d: any) => [d.attribute_name, d.attribute_value]))
              : firstV.attributes
          );

          const colorKey = Object.keys(attrs).find(k => /màu|color/i.test(k));
          const storageKey = Object.keys(attrs).find(k => /dung lượng|bộ nhớ|storage|ram|rom|size/i.test(k));

          if (colorKey) setSelectedColor(attrs[colorKey]);
          if (storageKey) setSelectedStorage(attrs[storageKey]);
        }

        const imgs = Array.isArray(iRes) ? iRes : (iRes?.data || []);
        setExtraImages(imgs);
      } catch (e: any) { setError(e.message || 'Lỗi'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleSelectColor = (colorVal: string) => {
    setSelectedColor(colorVal);
    const match = variants.find(v => {
      const attrs = parseAttrs(
        v.details?.length
          ? Object.fromEntries(v.details.map((d: any) => [d.attribute_name, d.attribute_value]))
          : v.attributes
      );
      const colorKey = Object.keys(attrs).find(k => /màu|color/i.test(k));
      const storageKey = Object.keys(attrs).find(k => /dung lượng|bộ nhớ|storage|ram|rom|size/i.test(k));

      const matchColor = colorKey ? attrs[colorKey] === colorVal : true;
      const matchStorage = storageKey ? attrs[storageKey] === selectedStorage : true;
      return matchColor && matchStorage;
    });

    if (match) {
      setSelectedVariant(match);
      if (match.image) {
        setActiveImg(match.image);
      }
    } else {
      const fallbackMatch = variants.find(v => {
        const attrs = parseAttrs(
          v.details?.length
            ? Object.fromEntries(v.details.map((d: any) => [d.attribute_name, d.attribute_value]))
            : v.attributes
        );
        const colorKey = Object.keys(attrs).find(k => /màu|color/i.test(k));
        return colorKey ? attrs[colorKey] === colorVal : false;
      });
      if (fallbackMatch) {
        setSelectedVariant(fallbackMatch);
        if (fallbackMatch.image) {
          setActiveImg(fallbackMatch.image);
        }
        const attrs = parseAttrs(
          fallbackMatch.details?.length
            ? Object.fromEntries(fallbackMatch.details.map((d: any) => [d.attribute_name, d.attribute_value]))
            : fallbackMatch.attributes
        );
        const storageKey = Object.keys(attrs).find(k => /dung lượng|bộ nhớ|storage|ram|rom|size/i.test(k));
        if (storageKey) setSelectedStorage(attrs[storageKey]);
      }
    }
  };

  const handleSelectStorage = (storageVal: string) => {
    setSelectedStorage(storageVal);
    const match = variants.find(v => {
      const attrs = parseAttrs(
        v.details?.length
          ? Object.fromEntries(v.details.map((d: any) => [d.attribute_name, d.attribute_value]))
          : v.attributes
      );
      const colorKey = Object.keys(attrs).find(k => /màu|color/i.test(k));
      const storageKey = Object.keys(attrs).find(k => /dung lượng|bộ nhớ|storage|ram|rom|size/i.test(k));

      const matchColor = colorKey ? attrs[colorKey] === selectedColor : true;
      const matchStorage = storageKey ? attrs[storageKey] === storageVal : true;
      return matchColor && matchStorage;
    });

    if (match) {
      setSelectedVariant(match);
      if (match.image) {
        setActiveImg(match.image);
      }
    } else {
      const fallbackMatch = variants.find(v => {
        const attrs = parseAttrs(
          v.details?.length
            ? Object.fromEntries(v.details.map((d: any) => [d.attribute_name, d.attribute_value]))
            : v.attributes
        );
        const storageKey = Object.keys(attrs).find(k => /dung lượng|bộ nhớ|storage|ram|rom|size/i.test(k));
        return storageKey ? attrs[storageKey] === storageVal : false;
      });
      if (fallbackMatch) {
        setSelectedVariant(fallbackMatch);
        if (fallbackMatch.image) {
          setActiveImg(fallbackMatch.image);
        }
        const attrs = parseAttrs(
          fallbackMatch.details?.length
            ? Object.fromEntries(fallbackMatch.details.map((d: any) => [d.attribute_name, d.attribute_value]))
            : fallbackMatch.attributes
        );
        const colorKey = Object.keys(attrs).find(k => /màu|color/i.test(k));
        if (colorKey) setSelectedColor(attrs[colorKey]);
      }
    }
  };

  const addToCart = async (andGo = false) => {
    if (!product) return;
    try {
      const user = api.getCurrentUser();
      const sessionId = api.getSessionId();
      
      let cartId = null;
      const cartsData = await api.getCarts(user?.id, !user ? sessionId : undefined);
      if (cartsData?.data && cartsData.data.length > 0) {
        cartId = cartsData.data[0].id;
      } else {
        const payload: any = {};
        if (user?.id) payload.user_id = user.id;
        else payload.session_id = sessionId;

        const newCartData = await api.createCart(payload);
        cartId = newCartData?.data?.id;
      }

      if (!cartId) throw new Error("Không thể khởi tạo giỏ hàng");

      await api.createCartItem({
        cart_id: cartId,
        product_id: product.id,
        product_variant_id: selectedVariant?.id || null,
        quantity: qty
      });

      window.dispatchEvent(new Event('cart-updated'));
      setCartFlash(true);
      setTimeout(() => setCartFlash(false), 2000);
      if (andGo) setTimeout(() => navigate('/cart'), 250);
    } catch (err: any) {
      console.error("Lỗi thêm vào giỏ hàng", err);
      alert("Lỗi thêm vào giỏ hàng: " + (err.message || JSON.stringify(err)));
    }
  };

  /* ── loading / error ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', background: '#1d1d1f' }}>
      <CircularProgress sx={{ color: '#E02020' }} size={44} />
      <p style={{ color: '#aaa', marginTop: 16 }}>Đang tải sản phẩm…</p>
    </div>
  );
  if (error || !product) return (
    <div style={{ padding: 32, background: '#1d1d1f', minHeight: '100vh' }}>
      <Alert severity="error">{error || 'Không tìm thấy sản phẩm'}</Alert>
    </div>
  );

  /* ── derived values ── */
  const seenUrls = new Set();
  const allImages: { id: string | number; url: string }[] = [];

  if (product.image) {
    allImages.push({ id: 0, url: product.image });
    seenUrls.add(product.image);
  }

  extraImages.forEach(img => {
    if (img.image_url && !seenUrls.has(img.image_url)) {
      allImages.push({ id: img.id, url: img.image_url });
      seenUrls.add(img.image_url);
    }
  });

  variants.forEach((v, idx) => {
    if (v.image && !seenUrls.has(v.image)) {
      allImages.push({ id: `v-${v.id || idx}`, url: v.image });
      seenUrls.add(v.image);
    }
  });

  const price = selectedVariant?.price ?? product.price;
  const oldPrice = product.oldprice;
  const hasDisc = Boolean(oldPrice && oldPrice > price);
  const discPct = hasDisc ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const outOfStock = product.quantity != null && product.quantity <= 0;
  const vipPts = Math.round((price || 0) * 0.001);

  // Group unique colors & storages
  const uniqueColors = Array.from(new Set(variants.flatMap(v => {
    const attrs = parseAttrs(
      v.details?.length
        ? Object.fromEntries(v.details.map((d: any) => [d.attribute_name, d.attribute_value]))
        : v.attributes
    );
    const colorKey = Object.keys(attrs).find(k => /màu|color/i.test(k));
    return colorKey ? [attrs[colorKey]] : [];
  })));

  const uniqueStorages = Array.from(new Set(variants.flatMap(v => {
    const attrs = parseAttrs(
      v.details?.length
        ? Object.fromEntries(v.details.map((d: any) => [d.attribute_name, d.attribute_value]))
        : v.attributes
    );
    const storageKey = Object.keys(attrs).find(k => /dung lượng|bộ nhớ|storage|ram|rom|size/i.test(k));
    return storageKey ? [attrs[storageKey]] : [];
  })));

  /* ── parse specification ── */
  const specLines: { k: string; v: string }[] = [];
  if (product.specification) {
    product.specification.split('\n').forEach((line: string) => {
      const c = line.indexOf(':');
      if (c > -1) specLines.push({ k: line.slice(0, c).trim(), v: line.slice(c + 1).trim() });
      else if (line.trim()) specLines.push({ k: '', v: line.trim() });
    });
  }
  const gTitles = ['Thông tin chung', 'Màn hình & Thiết kế', 'Hiệu năng & Bộ nhớ', 'Camera & Kết nối', 'Pin & Sạc', 'Khác'];
  const cs = Math.max(4, Math.ceil(specLines.length / 5));
  const specGroups = [];
  for (let i = 0; i < specLines.length; i += cs) {
    specGroups.push({ title: gTitles[specGroups.length] || `Nhóm ${specGroups.length + 1}`, rows: specLines.slice(i, i + cs).filter(r => r.k || r.v) });
  }

  return (
    <div style={{ background: '#1d1d1f', minHeight: '100vh' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span onClick={() => navigate('/')} style={{ color: '#E02020', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Trang chủ</span>
          <span style={{ color: '#444', fontSize: 13 }}>›</span>
          {product.category?.name && (
            <>
              <span onClick={() => navigate(`/?category_name=${encodeURIComponent(product.category.name)}`)} style={{ color: '#777', cursor: 'pointer', fontSize: 13 }}>{product.category.name}</span>
              <span style={{ color: '#444', fontSize: 13 }}>›</span>
            </>
          )}
          <span style={{ color: '#aaa', fontSize: 13, fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)',
          gap: 48,
          alignItems: 'start',
        }}>

          {/* ═══ LEFT: Media Gallery ═══ */}
          <div style={{ position: 'sticky', top: 24 }} className="gallery-wrap">
            <Gallery images={allImages} active={activeImg} onSelect={setActiveImg} />
          </div>

          {/* ═══ RIGHT: Product Configuration & Buying Info ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Title / Brand Header */}
            <div>
              {product.brand?.name && (
                <span style={{
                  display: 'inline-block', background: 'rgba(255,255,255,.08)',
                  color: '#aaa', fontSize: 11, fontWeight: 700, borderRadius: 4,
                  padding: '3px 8px', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5
                }}>{product.brand.name}</span>
              )}
              <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1.25, margin: 0 }}>
                {product.name} {selectedStorage && `(${selectedStorage})`}
              </h1>
              <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                Giá và khuyến mãi tại: <span style={{ color: '#1565C0', cursor: 'pointer' }}>Thành phố Hồ Chí Minh ▾</span>
              </div>
            </div>

            {/* Price block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#fff', fontSize: 32, fontWeight: 900, lineHeight: 1 }}>
                  {fmtVND(price)}
                </span>
                {hasDisc && (
                  <>
                    <span style={{ color: '#777', fontSize: 16, textDecoration: 'line-through' }}>{fmtVND(oldPrice)}</span>
                    <span style={{ background: '#E02020', color: '#fff', fontWeight: 800, fontSize: 12, padding: '3px 8px', borderRadius: 4 }}>
                      -{discPct}%
                    </span>
                  </>
                )}
              </div>

              {/* VIP points */}
              {vipPts > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
                  background: 'rgba(255,215,0,.08)', border: '1px solid rgba(255,215,0,.22)',
                  borderRadius: 20, padding: '6px 14px', marginTop: 4,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: '#FFD700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#1d1d1f', fontWeight: 900
                  }}>★</div>
                  <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 12 }}>
                    +{vipPts.toLocaleString('vi-VN')} điểm tích lũy Quà Tặng VIP <span style={{ color: '#aaa', fontWeight: 400, marginLeft: 4 }}>🛈</span>
                  </span>
                </div>
              )}

              {outOfStock && (
                <div style={{ marginTop: 6, color: '#FFD700', fontSize: 13, fontWeight: 600 }}>Sản phẩm tạm thời hết hàng</div>
              )}
            </div>

            {/* Colors Group */}
            {uniqueColors.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ color: '#aaa', fontSize: 13, fontWeight: 600 }}>
                  Màu: <span style={{ color: '#fff', fontWeight: 700 }}>{selectedColor}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {uniqueColors.map(col => (
                    <ColorDot
                      key={col}
                      colorName={col}
                      selected={selectedColor === col}
                      onClick={() => handleSelectColor(col)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Storage Group */}
            {uniqueStorages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ color: '#aaa', fontSize: 13, fontWeight: 600 }}>
                  Dung lượng:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {uniqueStorages.map(st => (
                    <StoragePill
                      key={st}
                      label={st}
                      selected={selectedStorage === st}
                      disabled={false}
                      onClick={() => handleSelectStorage(st)}
                    />
                  ))}
                </div>
                {selectedVariant && selectedVariant.price !== product.price && (
                  <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                    Giá phiên bản này: <strong style={{ color: '#fff' }}>{fmtVND(selectedVariant.price)}</strong>
                    {selectedVariant.quantity != null && ` · Còn ${selectedVariant.quantity} chiếc`}
                  </div>
                )}
              </div>
            )}

            {/* Promo Box */}
            <div style={{
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12,
              padding: 20,
              background: 'rgba(255,255,255,.02)',
            }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🎁</span> Khuyến mãi trị giá 500.000đ
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Tặng gói bảo vệ màn hình cao cấp',
                  'Trả góp 0% lãi suất lên đến 12 tháng',
                  'Đổi trả miễn phí trong 30 ngày',
                  'Miễn phí giao hàng toàn quốc',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#E02020', fontSize: 14 }}>•</span>
                    <span style={{ color: '#ccc', fontSize: 13, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Qty Picker & Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Qty picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
                <span style={{ color: '#aaa', fontSize: 13, fontWeight: 600 }}>Số lượng:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,.03)' }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    style={{ border: 'none', background: 'transparent', color: qty <= 1 ? '#555' : '#fff', padding: '8px 12px', cursor: qty <= 1 ? 'default' : 'pointer', fontSize: 16, fontFamily: 'inherit' }}
                  >−</button>
                  <span style={{ color: '#fff', fontWeight: 700, padding: '0 12px', fontSize: 14, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    style={{ border: 'none', background: 'transparent', color: '#fff', padding: '8px 12px', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}
                  >+</button>
                </div>
              </div>

              {/* Buying Row */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  variant="contained"
                  disabled={outOfStock}
                  onClick={() => addToCart(true)}
                  sx={{
                    flex: 3, py: 1.6, borderRadius: 2, fontWeight: 800, fontSize: '0.95rem',
                    bgcolor: '#1565C0', '&:hover': { bgcolor: '#0d47a1' },
                    boxShadow: '0 4px 14px rgba(21,101,192,.35)',
                    textTransform: 'none',
                  }}
                >
                  Mua ngay
                </Button>
                <Button
                  variant="outlined"
                  disabled={outOfStock}
                  onClick={() => addToCart(false)}
                  sx={{
                    flex: 1, py: 1.6, borderRadius: 2, fontWeight: 700,
                    borderColor: cartFlash ? '#2e7d32' : 'rgba(255,255,255,.2)',
                    color: cartFlash ? '#66bb6a' : '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.35)' },
                    transition: 'all .2s',
                    minWidth: 56,
                  }}
                >
                  <IconifyIcon icon={cartFlash ? 'mdi:check-circle' : 'mdi:cart-plus'} fontSize={20} />
                </Button>
              </div>


            </div>

            {/* Spec / Info rows */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoRow icon="mdi:package-variant-closed" text="Bộ sản phẩm gồm: Adapter sạc, Cáp, Hộp" />
              <InfoRow icon="mdi:shield-refresh" text="Bảo hành 12 tháng tại hệ thống siêu thị toàn quốc" />
              <InfoRow icon="mdi:truck-fast-outline" text="Giao hàng nhanh toàn quốc" />
              <InfoRow icon="mdi:phone-outline" text="Tổng đài hỗ trợ kỹ thuật miễn phí: 1900.9696 (8:00 – 21:30)" />
            </div>

          </div>{/* end right */}
        </div>{/* end grid */}

        {/* ── Bottom Tabs ── */}
        <div style={{ marginTop: 64 }}>
          <Box sx={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: '#888', fontWeight: 600, fontSize: 14,
                  textTransform: 'none', minWidth: 140, py: 1.8,
                  '&.Mui-selected': { color: '#fff' },
                },
                '& .MuiTabs-indicator': { bgcolor: '#E02020', height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab label="Mô tả" />
              <Tab label="Thông số kỹ thuật" />
              <Tab label="Đánh giá sản phẩm" />
            </Tabs>
          </Box>

          {/* Description */}
          <TabPanel value={tab} index={0}>
            {product.description ? (
              <div style={{ maxWidth: 880, margin: '0 auto', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '24px 32px', background: 'transparent' }}>
                <p style={{ color: '#eee', lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: 14, margin: 0 }}>
                  {product.description}
                </p>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#555', padding: '64px 0' }}>Chưa có mô tả chi tiết.</p>
            )}
          </TabPanel>

          {/* Specifications */}
          <TabPanel value={tab} index={1}>
            {specGroups.length > 0 ? (
              <div style={{ maxWidth: 880, margin: '0 auto' }}>
                {specGroups.map(g => <SpecGroup key={g.title} title={g.title} rows={g.rows} />)}
              </div>
            ) : specLines.length > 0 ? (
              <div style={{ maxWidth: 880, margin: '0 auto', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, overflow: 'hidden' }}>
                {specLines.map((line, i) => (
                  <div key={i} style={{ display: 'flex', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', background: i % 2 ? 'rgba(255,255,255,.01)' : 'transparent' }}>
                    <span style={{ color: '#888', fontSize: 13, width: '38%', flexShrink: 0 }}>{line.k}</span>
                    <span style={{ color: '#eee', fontSize: 13 }}>{line.v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#555', padding: '64px 0' }}>Chưa có thông số kỹ thuật.</p>
            )}
          </TabPanel>

          {/* Reviews */}
          <TabPanel value={tab} index={2}>
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '56px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>⭐️</div>
              <h3 style={{ color: '#f5f5f7', fontWeight: 700, margin: '0 0 10px' }}>Đánh giá sản phẩm này</h3>
              <p style={{ color: '#888', marginBottom: 32, lineHeight: 1.7 }}>
                Nếu đã mua sản phẩm tại ShopApp, hãy đánh giá ngay để chia sẻ trải nghiệm!
              </p>
              <Button variant="contained" size="large"
                sx={{ bgcolor: '#E02020', '&:hover': { bgcolor: '#c01818' }, borderRadius: 2, px: 5, py: 1.5, fontWeight: 700 }}
              >
                Viết đánh giá
              </Button>
            </div>
          </TabPanel>
        </div>

      </div>

    </div>
  );
};

export default ProductDetail;