import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

const StoreManager = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: localStorage.getItem('store_name') || 'Tech Shop Online',
    phone: localStorage.getItem('store_phone') || '0987654321',
    email: localStorage.getItem('store_email') || 'support@techshop.com',
    address: localStorage.getItem('store_address') || '123 Đường Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh',
    hours: localStorage.getItem('store_hours') || '08:00 - 22:00',
    description: localStorage.getItem('store_description') || 'Cửa hàng cung cấp các sản phẩm công nghệ cao cấp chính hãng từ Apple, Samsung, Xiaomi.',
  });
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    localStorage.setItem('store_name', storeInfo.name);
    localStorage.setItem('store_phone', storeInfo.phone);
    localStorage.setItem('store_email', storeInfo.email);
    localStorage.setItem('store_address', storeInfo.address);
    localStorage.setItem('store_hours', storeInfo.hours);
    localStorage.setItem('store_description', storeInfo.description);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Stack direction="column" p={4} spacing={4} width={1}>

      {success && <Alert severity="success">Đã lưu thông tin cấu hình cửa hàng thành công!</Alert>}

      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" fontWeight="bold" mb={4}>Thông tin cửa hàng</Typography>

        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tên cửa hàng"
                fullWidth
                variant="filled"
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Số điện thoại"
                fullWidth
                variant="filled"
                value={storeInfo.phone}
                onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email hỗ trợ"
                fullWidth
                variant="filled"
                value={storeInfo.email}
                onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Giờ làm việc"
                fullWidth
                variant="filled"
                placeholder="Ví dụ: 08:00 - 22:00"
                value={storeInfo.hours}
                onChange={(e) => setStoreInfo({ ...storeInfo, hours: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Địa chỉ cửa hàng"
                fullWidth
                variant="filled"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Giới thiệu cửa hàng"
                fullWidth
                multiline
                rows={4}
                variant="filled"
                value={storeInfo.description}
                onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>

        <Stack direction="row" mt={4} justifyContent="flex-end">
          <Button variant="contained" size="large" onClick={handleSave}>
            Lưu thông tin
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default StoreManager;
