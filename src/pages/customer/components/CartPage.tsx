import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { api } from 'services/api';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Image from 'components/base/Image';
import IconButton from '@mui/material/IconButton';
import IconifyIcon from 'components/base/IconifyIcon';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';



const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontSize: '0.88rem',
    '& fieldset': { border: '1px solid #dcdcdc' },
    '&:hover fieldset': { border: '1px solid #b5b5b5' },
    '&.Mui-focused fieldset': { border: '1px solid #0071e3', borderWidth: '1px' },
  },
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [city, setCity] = useState('Thành phố Hồ Chí Minh');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [note, setNote] = useState('');

  // API dynamic address state
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [provinceCode, setProvinceCode] = useState<number | ''>('');
  const [districtCode, setDistrictCode] = useState<number | ''>('');
  const [wardCode, setWardCode] = useState<number | ''>('');

  const handleProvinceChange = async (code: number) => {
    setProvinceCode(code);
    setDistrictCode('');
    setWardCode('');
    setDistricts([]);
    setWards([]);

    const prov = provinces.find(p => p.code === code);
    if (prov) setCity(prov.name);

    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts || []);
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  };

  const handleDistrictChange = async (code: number) => {
    setDistrictCode(code);
    setWardCode('');
    setWards([]);

    const dist = districts.find(d => d.code === code);
    if (dist) setDistrict(dist.name);

    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
      const data = await response.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error('Error fetching wards:', err);
    }
  };

  const handleWardChange = (code: number) => {
    setWardCode(code);
    const w = wards.find(item => item.code === code);
    if (w) setWard(w.name);
  };

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 0 && !digits.startsWith('0')) {
      digits = '0' + digits;
    }
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }
    setPhone(digits);
  };

  // Checkboxes
  const [giftReceiver, setGiftReceiver] = useState(false);
  const [transferData, setTransferData] = useState(false);
  const [companyInvoice, setCompanyInvoice] = useState(false);

  // Coupon
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    const user = api.getCurrentUser();
    const sessionId = api.getSessionId();
    try {
      const res = await api.getCarts(user?.id, !user ? sessionId : undefined);
      if (res?.data && res.data.length > 0) {
        setCartId(res.data[0].id);
        const mappedItems = res.data[0].cart_items.map((item: any) => ({
          cart_item_id: item.id,
          product_id: item.product_id,
          variant_id: item.product_variant_id,
          name: item.product?.name,
          image: item.product_variant?.image || item.product?.image,
          price: item.product_variant?.price ?? item.product?.price,
          quantity: item.quantity,
          variant: item.product_variant?.details?.length
            ? Object.fromEntries(item.product_variant.details.map((d: any) => [d.attribute_name, d.attribute_value]))
            : item.product_variant?.attributes,
        }));
        setCartItems(mappedItems);
        localStorage.setItem('cart', JSON.stringify(mappedItems));
      } else {
        setCartId(null);
        setCartItems([]);
        localStorage.setItem('cart', '[]');
      }
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchCart();

    // Autofill user details if signed in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.phone) {
          let p = String(u.phone).trim();
          if (p.length > 0 && !p.startsWith('0')) {
            p = '0' + p;
          }
          setPhone(p);
        }
        if (u.fullName) setFullName(String(u.fullName));
        else if (u.name) setFullName(String(u.name));
      } catch {
        // ignore
      }
    }

    // Load provinces from API
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        // Default select Ho Chi Minh City (code 79)
        const hcm = data.find((p: any) => p.name.includes('Hồ Chí Minh') || p.code === 79);
        if (hcm) {
          setProvinceCode(hcm.code);
          setCity(hcm.name);
          fetch(`https://provinces.open-api.vn/api/p/${hcm.code}?depth=2`)
            .then(r => r.json())
            .then(d => {
              setDistricts(d.districts || []);
            });
        }
      })
      .catch(err => console.error('Error loading provinces:', err));
  }, [fetchCart]);

  const handleQuantityChange = async (index: number, delta: number) => {
    const item = cartItems[index];
    const newQty = Math.max(1, item.quantity + delta);
    if (!item.cart_item_id) return;
    try {
      await api.updateCartItem(item.cart_item_id, { quantity: newQty });
      fetchCart();
    } catch (e) {
      alert("Lỗi cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (index: number) => {
    const item = cartItems[index];
    if (!item.cart_item_id) return;
    try {
      await api.deleteCartItem(item.cart_item_id);
      fetchCart();
    } catch (e) {
      alert("Lỗi xoá sản phẩm khỏi giỏ hàng");
    }
  };

  const totalPayment = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vipPoints = Math.round(totalPayment / 500);

  const fullAddress = deliveryMethod === 'delivery'
    ? `${streetAddress}, ${ward}, ${district}, ${city}`.replace(/^, |, ,/g, '')
    : 'Nhận tại cửa hàng';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!cartId) {
      alert('Không tìm thấy giỏ hàng!');
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      alert('Vui lòng đăng nhập trước khi thanh toán!');
      navigate('/authentication/signin');
      return;
    }

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      setError('Số điện thoại phải gồm đúng 10 chữ số (bắt đầu bằng số 0).');
      return;
    }

    if (deliveryMethod === 'delivery' && (!district || !ward || !streetAddress.trim())) {
      setError('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng.');
      return;
    }

    setError('');
    setCheckingOut(true);

    try {
      const checkoutResponse = await api.checkoutCart({
        cart_id: cartId,
        total: totalPayment,
        note: note || (giftReceiver ? 'Gọi người khác nhận hàng' : ''),
        phone: phone,
        address: fullAddress
      });

      if (checkoutResponse && !checkoutResponse.error) {
        localStorage.removeItem('cart');
        setCartItems([]);
        setCartId(null);
        window.dispatchEvent(new Event('cart-updated'));
        alert('Đặt hàng thành công! Đơn hàng đang được xử lý.');
        navigate('/my-orders');
      } else {
        throw new Error(checkoutResponse?.message || 'Lỗi thanh toán');
      }
    } catch (err: any) {
      console.error('Checkout Error:', err);
      setError(err.message || 'Lỗi khi thanh toán');
    } finally {
      setCheckingOut(false);
    }
  };

  const renderVariantName = (variant: any) => {
    if (!variant) return null;
    let attrs: any = {};
    try {
      attrs = typeof variant === 'string' ? JSON.parse(variant) : variant;
    } catch {
      return <Typography variant="caption" color="text.secondary">{String(variant)}</Typography>;
    }
    if (typeof attrs !== 'object' || attrs === null) {
      return <Typography variant="caption" color="text.secondary">{String(attrs)}</Typography>;
    }
    return (
      <Typography variant="caption" color="text.secondary">
        Phân loại: {Object.entries(attrs).map(([key, val]: any) => `${key}: ${val}`).join(' | ')}
      </Typography>
    );
  };

  if (cartItems.length === 0) {
    return (
      <Stack direction="column" p={{ xs: 2.5, md: 5 }} alignItems="center" justifyContent="center" minHeight="60vh" sx={{ bgcolor: '#f5f5f7', width: '100%' }}>
        <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', maxWidth: 440 }}>
          <IconifyIcon icon="solar:cart-large-minimalistic-outline" fontSize={64} sx={{ color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} mb={1}>Giỏ hàng của bạn đang trống</Typography>
          <Typography color="text.secondary" fontSize="0.88rem" mb={3}>Hãy tiếp tục mua sắm để thêm sản phẩm vào giỏ.</Typography>
          <Button variant="contained" href="/"
            sx={{ py: 1.2, px: 4, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: '#0071e3', '&:hover': { bgcolor: '#0077ed' } }}>
            Quay về trang chủ
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack direction="column" sx={{ bgcolor: '#f5f5f7', minHeight: '100vh', pb: 10, px: 2, pt: 3, width: '100%' }} alignItems="center">
      {/* Upper Navigation Row */}
      <Stack direction="row" width="100%" maxWidth="620px" mb={1.5} px={0.5}>
        <Button
          href="/"
          startIcon={<IconifyIcon icon="material-symbols:keyboard-arrow-left" fontSize={18} />}
          sx={{ textTransform: 'none', color: '#0071e3', fontSize: '0.88rem', fontWeight: 500, minWidth: 0, p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
        >
          Về trang chủ
        </Button>
      </Stack>

      {/* Main Single Column Card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '620px',
          bgcolor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #e3e3e3',
          overflow: 'hidden',
          p: { xs: 2.5, sm: 3 }
        }}
      >
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }}>{error}</Alert>}

        <form onSubmit={handleCheckout}>
          {/* 1. Cart Items List */}
          <Stack direction="column" spacing={3}>
            {cartItems.map((item, index) => {
              const originalPrice = Math.round(item.price * 1.1); // Simulated original price
              return (
                <Box key={`${item.product_id}-${item.variant_id || index}`}>
                  <Stack direction="row" spacing={2.5} alignItems="flex-start" position="relative">
                    {/* Image Column */}
                    <Stack direction="column" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                      <Box
                        sx={{
                          width: 85,
                          height: 85,
                          borderRadius: '8px',
                          border: '1px solid #f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 0.5,
                          bgcolor: '#fafafa'
                        }}
                      >
                        <Image src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>
                      {/* Delete button */}
                      <Button
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        startIcon={<IconifyIcon icon="solar:trash-bin-trash-outline" fontSize={13} />}
                        sx={{
                          color: '#86868b',
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          p: 0,
                          minWidth: 0,
                          '&:hover': { color: '#d32f2f', bgcolor: 'transparent' }
                        }}
                      >
                        Xóa
                      </Button>
                    </Stack>

                    {/* Content Column */}
                    <Stack direction="column" flexGrow={1} spacing={1} minWidth={0}>
                      {/* Name & Prices */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                        <Typography fontWeight={600} fontSize="0.95rem" sx={{ color: '#1d1d1f', lineHeight: 1.3, pr: 2 }}>
                          {item.name}
                        </Typography>
                        <Stack direction="column" alignItems="flex-end" sx={{ flexShrink: 0 }}>
                          <Typography fontWeight={700} fontSize="0.95rem" color="#d32f2f">
                            {item.price?.toLocaleString('vi-VN')}đ
                          </Typography>
                          <Typography fontSize="0.8rem" color="#86868b" sx={{ textDecoration: 'line-through' }}>
                            {originalPrice.toLocaleString('vi-VN')}đ
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Variant */}
                      <Stack direction="column" spacing={0.5}>
                        {renderVariantName(item.variant)}
                      </Stack>

                      {/* Quantity Selector on the Right */}
                      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{
                            border: '1px solid #dcdcdc',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            bgcolor: '#ffffff'
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(index, -1)}
                            sx={{ borderRadius: 0, width: 28, height: 28, color: '#1d1d1f' }}
                          >
                            <IconifyIcon icon="material-symbols:remove" fontSize={13} />
                          </IconButton>
                          <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(index, 1)}
                            sx={{ borderRadius: 0, width: 28, height: 28, color: '#1d1d1f' }}
                          >
                            <IconifyIcon icon="material-symbols:add" fontSize={13} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                  {index < cartItems.length - 1 && <Divider sx={{ my: 3, borderColor: '#f0f0f2' }} />}
                </Box>
              );
            })}
          </Stack>

          {/* Subtotal Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f0f2' }}>
            <Typography fontSize="0.88rem" fontWeight={500} color="#1d1d1f">
              Tạm tính ({cartItems.length} sản phẩm):
            </Typography>
            <Typography fontSize="0.95rem" fontWeight={700} color="#1d1d1f">
              {totalPayment.toLocaleString('vi-VN')}đ
            </Typography>
          </Stack>

          {/* 2. Customer Information Section */}
          <Box sx={{ mt: 4 }}>
            <Typography fontWeight={700} fontSize="0.95rem" color="#1d1d1f" mb={1.5}>
              Thông tin khách hàng
            </Typography>
            <RadioGroup
              row
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              sx={{ gap: 2, mb: 2 }}
            >
              <FormControlLabel
                value="male"
                control={<Radio size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#0071e3' } }} />}
                label={<Typography fontSize="0.88rem" color="#1d1d1f">Anh</Typography>}
                sx={{ m: 0 }}
              />
              <FormControlLabel
                value="female"
                control={<Radio size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#0071e3' } }} />}
                label={<Typography fontSize="0.88rem" color="#1d1d1f">Chị</Typography>}
                sx={{ m: 0 }}
              />
            </RadioGroup>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Họ và Tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                sx={inputStyle}
              />
              <TextField
                fullWidth
                size="small"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                sx={inputStyle}
              />
            </Stack>
          </Box>

          {/* 3. Delivery Method Section */}
          <Box sx={{ mt: 4 }}>
            <Typography fontWeight={700} fontSize="0.95rem" color="#1d1d1f" mb={1.5}>
              Chọn hình thức nhận hàng
            </Typography>

            <RadioGroup
              row
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value as any)}
              sx={{ gap: 3, mb: 2 }}
            >
              <FormControlLabel
                value="delivery"
                control={<Radio size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#0071e3' } }} />}
                label={<Typography fontSize="0.88rem" color="#1d1d1f">Giao tận nơi</Typography>}
                sx={{ m: 0 }}
              />
              <FormControlLabel
                value="pickup"
                control={<Radio size="small" sx={{ p: 0.5, '&.Mui-checked': { color: '#0071e3' } }} />}
                label={<Typography fontSize="0.88rem" color="#1d1d1f">Nhận tại cửa hàng</Typography>}
                sx={{ m: 0 }}
              />
            </RadioGroup>

            {/* Address Gray Container */}
            <Collapse in={deliveryMethod === 'delivery'}>
              <Box
                sx={{
                  bgcolor: '#f5f5f7',
                  borderRadius: '12px',
                  p: 2,
                  border: '1px solid #e3e3e3',
                  mb: 2.5
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={1.5}>
                  {/* Tỉnh / Thành phố */}
                  <Autocomplete
                    options={provinces}
                    getOptionLabel={(option) => option.name || ''}
                    value={provinces.find(p => p.code === provinceCode) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleProvinceChange(newValue.code);
                      } else {
                        setProvinceCode('');
                        setCity('');
                        setDistrictCode('');
                        setWardCode('');
                        setDistricts([]);
                        setWards([]);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Chọn Tỉnh / Thành phố"
                        size="small"
                        sx={inputStyle}
                      />
                    )}
                    fullWidth
                  />

                  {/* Quận / Huyện */}
                  <Autocomplete
                    options={districts}
                    getOptionLabel={(option) => option.name || ''}
                    value={districts.find(d => d.code === districtCode) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleDistrictChange(newValue.code);
                      } else {
                        setDistrictCode('');
                        setDistrict('');
                        setWardCode('');
                        setWards([]);
                      }
                    }}
                    disabled={!provinceCode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Chọn Quận / Huyện"
                        size="small"
                        sx={inputStyle}
                      />
                    )}
                    fullWidth
                  />

                  {/* Phường / Xã */}
                  <Autocomplete
                    options={wards}
                    getOptionLabel={(option) => option.name || ''}
                    value={wards.find(w => w.code === wardCode) || null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleWardChange(newValue.code);
                      } else {
                        setWardCode('');
                        setWard('');
                      }
                    }}
                    disabled={!districtCode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Chọn Phường / Xã"
                        size="small"
                        sx={inputStyle}
                      />
                    )}
                    fullWidth
                  />
                </Stack>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Số nhà, tên đường"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  sx={inputStyle}
                />
              </Box>
            </Collapse>

            <Collapse in={deliveryMethod === 'pickup'}>
              <Box
                sx={{
                  bgcolor: '#f5f5f7',
                  borderRadius: '12px',
                  p: 2,
                  border: '1px solid #e3e3e3',
                  mb: 2.5
                }}
              >
                <Typography fontSize="0.88rem" fontWeight={500} color="#1d1d1f">
                  📍 Nhận máy tại cửa hàng HGPHONE:
                </Typography>
                <Typography fontSize="0.82rem" color="#86868b" sx={{ mt: 0.5 }}>
                  123 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh
                </Typography>
              </Box>
            </Collapse>

            {/* Note text field */}
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập ghi chú (nếu có)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={inputStyle}
            />
          </Box>

          {/* 4. Checkboxes */}
          <Stack direction="column" spacing={0.5} sx={{ mt: 2.5 }}>
            <FormControlLabel
              control={<Checkbox size="small" checked={giftReceiver} onChange={(e) => setGiftReceiver(e.target.checked)} sx={{ p: 0.5, '&.Mui-checked': { color: '#0071e3' } }} />}
              label={<Typography fontSize="0.85rem" color="#1d1d1f">Gọi người khác nhận hàng</Typography>}
              sx={{ m: 0 }}
            />
            <FormControlLabel
              control={<Checkbox size="small" checked={transferData} onChange={(e) => setTransferData(e.target.checked)} sx={{ p: 0.5, '&.Mui-checked': { color: '#0071e3' } }} />}
              label={<Typography fontSize="0.85rem" color="#1d1d1f">Chuyển danh bạ, dữ liệu qua máy mới</Typography>}
              sx={{ m: 0 }}
            />
            <FormControlLabel
              control={<Checkbox size="small" checked={companyInvoice} onChange={(e) => setCompanyInvoice(e.target.checked)} sx={{ p: 0.5, '&.Mui-checked': { color: '#0071e3' } }} />}
              label={<Typography fontSize="0.85rem" color="#1d1d1f">Xuất hóa đơn công ty</Typography>}
              sx={{ m: 0 }}
            />
          </Stack>

          <Divider sx={{ my: 3, borderColor: '#f0f0f2' }} />

          {/* 5. Coupon accordion */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCouponOpen(v => !v)}
              startIcon={<IconifyIcon icon="solar:ticket-bold-duotone" fontSize={18} />}
              endIcon={<IconifyIcon icon={couponOpen ? 'material-symbols:keyboard-arrow-up' : 'material-symbols:keyboard-arrow-down'} fontSize={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderColor: '#dcdcdc',
                color: '#1d1d1f',
                '&:hover': { borderColor: '#b5b5b5', bgcolor: '#f5f5f7' }
              }}
            >
              Sử dụng mã giảm giá
            </Button>
            <Collapse in={couponOpen}>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="Nhập mã giảm giá"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  sx={{ ...inputStyle, flex: 1 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#0071e3',
                    px: 3,
                    '&:hover': { bgcolor: '#0077ed' }
                  }}
                >
                  Áp dụng
                </Button>
              </Stack>
            </Collapse>
          </Box>

          {/* 6. Summary Rows */}
          <Stack direction="column" spacing={1.2} sx={{ mb: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={700} fontSize="0.95rem" color="#1d1d1f">
                Tổng tiền:
              </Typography>
              <Typography fontWeight={700} fontSize="1.1rem" color="#d32f2f">
                {totalPayment.toLocaleString('vi-VN')}đ
              </Typography>
            </Stack>


          </Stack>

          {/* 7. Action Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={checkingOut}
            sx={{
              py: 1.5,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              bgcolor: '#0071e3',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0077ed', boxShadow: 'none' }
            }}
          >
            {checkingOut ? <CircularProgress size={22} color="inherit" /> : 'Đặt hàng'}
          </Button>

          <Typography textAlign="center" fontSize="0.78rem" color="#86868b" sx={{ mt: 2 }}>
            Bạn có thể lựa chọn các hình thức thanh toán ở bước sau
          </Typography>
        </form>
      </Box>
    </Stack>
  );
};

export default CartPage;
