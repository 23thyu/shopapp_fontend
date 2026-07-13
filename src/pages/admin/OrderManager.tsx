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
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { API_BASE_URL } from 'services/api';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { api } from 'services/api';

const OrderManager = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders('all');
      setOrders(Array.isArray(res) ? res : (res?.data || []));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= orders.length) {
      setPage(Math.max(0, Math.ceil(orders.length / rowsPerPage) - 1));
    }
  }, [orders, page, rowsPerPage]);

  const handleOpenDetails = async (order: any) => {
    try {
      const res = await api.getOrderById(order.id);
      setSelectedOrder(res.data);
      setUpdateStatus(res.data.status || 0);
      setDetailsOpen(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await api.updateOrder(selectedOrder.id, { status: updateStatus });
      setDetailsOpen(false);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Bạn có muốn xóa đơn hàng này?')) return;
    try {
      await api.deleteOrder(id);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa đơn hàng');
    }
  };

  if (loading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack direction="column" p={4} spacing={4} width={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">Quản lý đơn hàng</Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Mã Đơn</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Người mua</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.user?.name || order.user_id || 'Ẩn danh'}</TableCell>
                  <TableCell>{order.note || 'Không có ghi chú'}</TableCell>
                  <TableCell color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {order.total?.toLocaleString('vi-VN')} đ
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        order.status === 0 ? 'Đang xử lý' :
                        order.status === 1 ? 'Đang giao' :
                        order.status === 2 ? 'Đã hoàn thành' : 'Đã hủy'
                      }
                      color={
                        order.status === 0 ? 'warning' :
                        order.status === 1 ? 'info' :
                        order.status === 2 ? 'success' : 'error'
                      }
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small" onClick={() => handleOpenDetails(order)}>Chi tiết</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteOrder(order.id)}>Xóa</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">Chưa có đơn hàng nào</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Details / Status Edit Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={3} mt={2}>
            <Box sx={{ p: 2.5, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <Typography fontWeight="600" color="text.secondary">Khách hàng:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography fontWeight="500">{selectedOrder?.user?.name || 'Ẩn danh'}</Typography>
                </Grid>

                <Grid item xs={5}>
                  <Typography fontWeight="600" color="text.secondary">Số điện thoại:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography fontWeight="500">{selectedOrder?.user?.phone || 'Chưa cập nhật'}</Typography>
                </Grid>

                <Grid item xs={5}>
                  <Typography fontWeight="600" color="text.secondary">Email:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography fontWeight="500" sx={{ wordBreak: 'break-all' }}>{selectedOrder?.user?.email || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={5}>
                  <Typography fontWeight="600" color="text.secondary">Ghi chú:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography fontWeight="500" color={selectedOrder?.note ? 'text.primary' : 'text.disabled'}>
                    {selectedOrder?.note || 'Không có ghi chú'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography fontWeight="bold" sx={{ mb: 2 }}>Sản phẩm đã đặt:</Typography>
                  <Stack spacing={2}>
                    {selectedOrder?.order_details?.map((detail: any) => (
                      <Stack key={detail.id} direction="row" spacing={2} alignItems="center">
                        <Box
                          component="img"
                          src={
                            detail.product_variant?.image
                              ? (detail.product_variant.image.startsWith('http') ? detail.product_variant.image : `${API_BASE_URL}/images/${detail.product_variant.image}`)
                              : detail.product?.image
                              ? (detail.product.image.startsWith('http') ? detail.product.image : `${API_BASE_URL}/images/${detail.product.image}`)
                              : '/placeholder.png'
                          }
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                        />
                        <Box flex={1}>
                          <Typography fontWeight="500">{detail.product?.name}</Typography>
                          {detail.product_variant && (
                            <Typography variant="body2" color="text.secondary">
                              Phân loại: {detail.product_variant.details?.map((d: any) => `${d.attribute_name}: ${d.attribute_value}`).join(', ')}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            Số lượng: {detail.number_of_products} x {detail.price?.toLocaleString('vi-VN')} đ
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                    {(!selectedOrder?.order_details || selectedOrder.order_details.length === 0) && (
                      <Typography variant="body2" color="text.secondary">Không có thông tin sản phẩm</Typography>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={5}>
                  <Typography fontWeight="bold" color="primary.main" variant="h6">Tổng thanh toán:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography fontWeight="bold" color="primary.main" variant="h6">
                    {selectedOrder?.total?.toLocaleString('vi-VN')} đ
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <FormControl fullWidth variant="filled">
              <InputLabel>Cập nhật trạng thái</InputLabel>
              <Select
                value={updateStatus}
                label="Cập nhật trạng thái"
                onChange={(e) => setUpdateStatus(Number(e.target.value))}
              >
                <MenuItem value={0}>Đang xử lý</MenuItem>
                <MenuItem value={1}>Đang giao</MenuItem>
                <MenuItem value={2}>Đã hoàn thành</MenuItem>
                <MenuItem value={3}>Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDetailsOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleUpdateStatus} disabled={updating}>
            {updating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrderManager;
