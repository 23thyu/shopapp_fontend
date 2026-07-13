import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import IconifyIcon from 'components/base/IconifyIcon';
import { api } from 'services/api';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Payment Selection state
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [toastOpen, setToOpen] = useState(false);

  // Current logged in user name
  const [currentUserName, setCurrentUserName] = useState('Khách hàng');

  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToOpen(true);
  };

  const handleSelectOrder = async (order: any) => {
    setSelectedOrder(order);
    setDetailsLoading(true);
    try {
      const res = await api.getOrderById(order.id);
      setSelectedOrderDetails(res?.data || res);

      // Attempt to parse payment method from note if it was updated previously
      const noteStr = res?.data?.note || res?.note || '';
      if (noteStr.includes('Hình thức thanh toán: ')) {
        const parts = noteStr.split('Hình thức thanh toán: ');
        const savedMethod = parts[1]?.trim();
        if (savedMethod === 'Chuyển khoản ngân hàng') {
          setPaymentMethod('bank');
        } else {
          setPaymentMethod('cash');
        }
      } else {
        setPaymentMethod('cash');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải chi tiết đơn hàng', 'error');
      setSelectedOrder(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setCurrentUserName(userObj.name || 'Khách hàng');
      } catch (e) {
        console.error(e);
      }
    }

    if (!token) {
      setError('Vui lòng đăng nhập để xem lịch sử mua hàng.');
      setLoading(false);
      return;
    }
    try {
      const res = await api.getOrders();
      const fetchedOrders = Array.isArray(res) ? res : (res?.data || []);
      setOrders(fetchedOrders);
      if (fetchedOrders.length > 0) {
        handleSelectOrder(fetchedOrders[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);



  const handleCancelOrder = async (orderId: number) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?');
    if (!confirmCancel) return;

    try {
      await api.deleteOrder(orderId);
      showToast('Đơn hàng đã được yêu cầu hủy thành công', 'success');
      // Refresh details & order list
      fetchMyOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = await api.getOrderById(orderId);
        setSelectedOrderDetails(updated?.data || updated);
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi hủy đơn hàng', 'error');
    }
  };

  const handleConfirmPaymentMethod = async () => {
    if (!selectedOrderDetails) return;
    setPaymentSubmitting(true);
    try {
      const methodLabel = paymentMethod === 'cash' ? 'Thanh toán tiền mặt khi nhận hàng' : 'Chuyển khoản ngân hàng';
      const cleanNote = (selectedOrderDetails.note || '').split(' | Hình thức thanh toán: ')[0];
      const updatedNote = cleanNote
        ? `${cleanNote} | Hình thức thanh toán: ${methodLabel}`
        : `Hình thức thanh toán: ${methodLabel}`;

      await api.updateOrder(selectedOrderDetails.id, { note: updatedNote });
      showToast('Cập nhật phương thức thanh toán thành công!', 'success');

      // Update local state
      setSelectedOrderDetails({
        ...selectedOrderDetails,
        note: updatedNote
      });
      fetchMyOrders();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật phương thức thanh toán', 'error');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  // --- RENDERING DETAIL VIEW (Apple/TopZone success style) ---
  if (selectedOrder && selectedOrderDetails) {
    const order = selectedOrderDetails;
    const pointsEarned = Math.round((order.total || 0) * 0.002);

    // Delivery Date calculation (Order date + 1 day)
    const orderDate = new Date(order.created_at || new Date());
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 1);
    const dayStr = deliveryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const weekdayStr = deliveryDate.getDay() === 0 ? 'Chủ Nhật' : `Thứ ${deliveryDate.getDay() + 1}`;

    return (
      <Stack py={4} px={{ xs: 2, md: 8 }} alignItems="center" width={1} sx={{ bgcolor: '#f4f5f8', minHeight: '100vh' }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 680,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            p: 4,
            mx: 'auto'
          }}
        >


          {/* User greeting */}
          <Typography variant="body2" sx={{ color: '#333333', mb: 3, fontSize: '14.5px' }}>
            Cảm ơn Anh/Chị <Box component="span" sx={{ fontWeight: 700 }}>{currentUserName}</Box> đã cho HGPhone cơ hội được phục vụ.
          </Typography>

          {/* Yellow Warning Box */}
          <Box
            sx={{
              border: '1px solid #ffd43b',
              bgcolor: '#fff9db',
              borderRadius: '8px',
              p: 2,
              mb: 3
            }}
          >
            <Typography variant="body2" sx={{ color: '#f08c00', fontWeight: 700, mb: 1, fontSize: '13.5px' }}>
              Để tránh mất tiền vào tay kẻ mạo danh Shipper, bạn TUYỆT ĐỐI:
            </Typography>
            <Stack spacing={0.5} sx={{ color: '#e67e22', pl: 1, fontSize: '13px' }}>
              <Typography variant="body2">• <Box component="span" sx={{ fontWeight: 700 }}>KHÔNG</Box> chuyển khoản bất kì ai khi chưa nhận hàng</Typography>
              <Typography variant="body2">• <Box component="span" sx={{ fontWeight: 700 }}>KHÔNG</Box> nhấn bất kì đường dẫn (link) lạ Shipper gửi</Typography>
            </Stack>
          </Box>

          {/* Order Details Gray Container */}
          <Box
            sx={{
              bgcolor: '#f5f5f7',
              borderRadius: '12px',
              p: 3,
              mb: 3,
              position: 'relative'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={700} sx={{ color: '#1d1d1f' }}>
                Đơn hàng: #{order.id}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="text"
                  onClick={() => setSelectedOrder(null)}
                  sx={{ p: 0, textTransform: 'none', color: '#0066cc', fontWeight: 600, minWidth: 'auto', fontSize: '13px' }}
                >
                  Quản lý đơn hàng
                </Button>
                <Typography variant="caption" color="text.disabled">•</Typography>
                <Button
                  variant="text"
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={order.status !== 0}
                  sx={{ p: 0, textTransform: 'none', color: order.status === 0 ? '#ff3b30' : 'text.disabled', fontWeight: 600, minWidth: 'auto', fontSize: '13px' }}
                >
                  Hủy
                </Button>
              </Stack>
            </Stack>

            <Stack spacing={1.5} sx={{ fontSize: '13.5px', color: '#1d1d1f' }}>
              <Typography variant="body2">• <Box component="span" sx={{ fontWeight: 700 }}>Người nhận:</Box> {currentUserName}, {order.phone || 'Chưa có SĐT'}</Typography>
              <Typography variant="body2">• <Box component="span" sx={{ fontWeight: 700 }}>Giao đến:</Box> {order.address || 'Chưa cập nhật'} <Box component="span" sx={{ color: '#86868b' }}>(nhân viên sẽ gọi xác nhận trước khi giao).</Box></Typography>
              <Typography variant="body2">• <Box component="span" sx={{ fontWeight: 700 }}>Phí giao hàng:</Box> 30.000đ</Typography>
              <Typography variant="body2">• <Box component="span" sx={{ fontWeight: 700 }}>Tổng tiền:</Box> <Box component="span" sx={{ fontWeight: 700, fontSize: '14.5px' }}>{order.total?.toLocaleString('vi-VN')}đ</Box></Typography>
            </Stack>
          </Box>


          {/* Payment Status Label Box */}
          <Box
            sx={{
              border: order.status === 2 ? '1px solid #4caf50' : '1px dashed #f76707',
              bgcolor: order.status === 2 ? '#e8f5e9' : '#fff9db',
              borderRadius: '6px',
              py: 1.5,
              textAlign: 'center',
              mb: 3
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ color: order.status === 2 ? '#2e7d32' : '#f76707', fontSize: '13.5px' }}>
              {order.status === 2 ? 'Đơn hàng đã được thanh toán' : 'Đơn hàng chưa được thanh toán'}
            </Typography>
          </Box>

          {/* Payment Method Selector */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#1d1d1f', mb: 1.5, fontSize: '14.5px' }}>
              Chọn hình thức thanh toán:
            </Typography>
            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <FormControlLabel
                value="cash"
                control={<Radio size="small" sx={{ color: '#000', '&.Mui-checked': { color: '#000' } }} />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconifyIcon icon="material-symbols:payments-outline" color="#555" fontSize={18} />
                    <Typography variant="body2" sx={{ fontSize: '13.5px' }}>Thanh toán tiền mặt khi nhận hàng</Typography>
                  </Stack>
                }
                sx={{ mb: 0.5 }}
              />
              <FormControlLabel
                value="bank"
                control={<Radio size="small" sx={{ color: '#000', '&.Mui-checked': { color: '#000' } }} />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconifyIcon icon="material-symbols:account-balance-outline" color="#555" fontSize={18} />
                    <Typography variant="body2" sx={{ fontSize: '13.5px' }}>Chuyển khoản ngân hàng</Typography>
                  </Stack>
                }
              />
            </RadioGroup>

            <Button
              variant="text"
              sx={{
                textTransform: 'none',
                color: '#0066cc',
                fontWeight: 500,
                fontSize: '13px',
                p: 0,
                mt: 1,
                display: 'block'
              }}
            >
              7 hình thức thanh toán khác <Box component="span" sx={{ fontSize: '11px' }}>▼</Box>
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirmPaymentMethod}
              disabled={paymentSubmitting}
              sx={{
                bgcolor: '#1d1d1f',
                color: '#ffffff',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '8px',
                mt: 2.5,
                textTransform: 'uppercase',
                fontSize: '14px',
                letterSpacing: '0.05em',
                '&:hover': {
                  bgcolor: '#333333'
                }
              }}
            >
              {paymentSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
            </Button>

            <Stack alignItems="center" spacing={1} sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#86868b', fontSize: '12px' }}>
                Khi cần hỗ trợ vui lòng gọi <Box component="span" sx={{ fontWeight: 700, color: '#1d1d1f' }}>1900 9696 42</Box> (08h00 - 21h30)
              </Typography>
              <Typography
                variant="caption"
                component="a"
                href="/news-list"
                sx={{ color: '#0066cc', textDecoration: 'none', fontWeight: 500, fontSize: '12px', '&:hover': { textDecoration: 'underline' } }}
              >
                Xem chính sách hoàn tiền online
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Delivery Date & Products Section */}
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#1d1d1f', mb: 1, fontSize: '14.5px' }}>
              Thời gian nhận hàng
            </Typography>

            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', p: 3, mb: 3 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#2e7d32', mb: 2, fontSize: '13px' }}>
                Nhận hàng trước 17h00 {weekdayStr} ({dayStr})
              </Typography>

              {detailsLoading ? (
                <Stack py={3} alignItems="center">
                  <CircularProgress size={28} />
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {order.order_details?.map((detail: any) => {
                    const prodName = detail.product?.name || `Sản phẩm #${detail.product_id}`;
                    const prodImg = detail.product?.image || '';
                    return (
                      <Stack key={detail.id} direction="row" spacing={2} alignItems="center">
                        <Box
                          component="img"
                          src={prodImg}
                          alt={prodName}
                          sx={{
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            p: 0.5
                          }}
                          onError={(e: any) => {
                            e.target.src = 'https://placehold.co/100x100?text=TopZone';
                          }}
                        />
                        <Stack spacing={0.5} flexGrow={1}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#1d1d1f', fontSize: '13px' }}>
                            {prodName}
                          </Typography>
                          {detail.product_variant && (
                            <Typography variant="caption" sx={{ color: '#86868b' }}>
                              Màu: {detail.product_variant.color || 'Mặc định'}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ color: '#86868b' }}>
                            Số lượng: {detail.quantity}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#1d1d1f', fontSize: '13.5px' }}>
                          {(detail.price * detail.quantity).toLocaleString('vi-VN')}đ
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>

          {/* Footer Back Button */}
          <Button
            variant="outlined"
            fullWidth
            href="/"
            sx={{
              borderColor: '#0066cc',
              color: '#0066cc',
              fontWeight: 700,
              py: 1.25,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '13.5px',
              '&:hover': {
                borderColor: '#0055b3',
                bgcolor: 'rgba(0, 102, 204, 0.04)'
              }
            }}
          >
            Về trang chủ
          </Button>

        </Paper>

        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert onClose={() => setToOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </Stack>
    );
  }

  // --- RENDERING LIST OF ORDERS (Default Dashboard View) ---
  return (
    <Stack p={{ xs: 2, md: 5 }} spacing={4} width={1} sx={{ bgcolor: '#f4f5f8', minHeight: '80vh' }}>


      {error && (
        <Alert severity="warning" sx={{ borderRadius: '12px' }}>
          {error}
          {!localStorage.getItem('token') && (
            <Button size="small" variant="outlined" sx={{ ml: 2, textTransform: 'none' }} href="/authentication/signin">
              Đăng nhập ngay
            </Button>
          )}
        </Alert>
      )}

      {!error && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            bgcolor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.04)',
            maxWidth: 1200,
            width: '100%',
            mx: 'auto'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: '2px solid rgba(0,0,0,0.05)', color: '#86868b', fontWeight: 700 } }}>
                  <TableCell>Mã Đơn</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Ngày đặt</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(0,0,0,0.03)' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1d1d1f' }}>#{order.id}</TableCell>
                    <TableCell sx={{ color: '#555555', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.note || 'Không có ghi chú'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1d1d1f' }}>
                      {order.total?.toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell sx={{ color: '#86868b' }}>
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          order.status === 0 ? 'Chờ xử lý' :
                            order.status === 1 ? 'Đang giao' :
                              order.status === 2 ? 'Đã hoàn thành' : 'Đã hủy/thất bại'
                        }
                        color={
                          order.status === 0 ? 'warning' :
                            order.status === 1 ? 'info' :
                              order.status === 2 ? 'success' : 'error'
                        }
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSelectOrder(order)}
                        sx={{
                          borderColor: '#1d1d1f',
                          color: '#1d1d1f',
                          textTransform: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '13px',
                          '&:hover': {
                            borderColor: '#333',
                            bgcolor: 'rgba(0,0,0,0.02)'
                          }
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#86868b' }}>
                      Bạn chưa đặt đơn hàng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setToOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </MuiAlert>
      </Snackbar>
    </Stack>
  );
};

export default MyOrdersPage;
