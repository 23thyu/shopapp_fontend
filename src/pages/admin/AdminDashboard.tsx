import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid'; // MUI Grid
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
import IconifyIcon from 'components/base/IconifyIcon';
import { api } from 'services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    categories: 0,
    brands: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes, usersRes, categoriesRes, brandsRes] = await Promise.all([
          api.getProducts('all').catch(() => ({ data: [] })),
          api.getOrders().catch(() => ({ data: [] })),
          api.getUsers().catch(() => ({ data: [] })),
          api.getCategories().catch(() => ({ data: [] })),
          api.getBrands().catch(() => ({ data: [] })),
        ]);

        const products = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);
        const users = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);
        const categories = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data || []);
        const brands = Array.isArray(brandsRes) ? brandsRes : (brandsRes?.data || []);

        setStats({
          products: products.length,
          orders: orders.length,
          users: users.length,
          categories: categories.length,
          brands: brands.length,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Sản phẩm', value: stats.products, icon: 'material-symbols:package-2-outline', color: '#1A73E8', gradient: 'linear-gradient(135deg, #E8F0FE 0%, #D2E3FC 100%)' },
    { title: 'Đơn hàng', value: stats.orders, icon: 'material-symbols:shopping-cart-outline', color: '#34A853', gradient: 'linear-gradient(135deg, #E6F4EA 0%, #CEEAD6 100%)' },
    { title: 'Người dùng', value: stats.users, icon: 'material-symbols:group-outline', color: '#F9AB00', gradient: 'linear-gradient(135deg, #FEF7E0 0%, #FEEFC3 100%)' },
    { title: 'Danh mục', value: stats.categories, icon: 'material-symbols:folder-open-outline', color: '#EA4335', gradient: 'linear-gradient(135deg, #FCE8E6 0%, #FAD2CF 100%)' },
    { title: 'Thương hiệu', value: stats.brands, icon: 'material-symbols:sell-outline', color: '#AB47BC', gradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' },
  ];

  if (loading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack direction="column" p={4} spacing={4} width={1}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3} columns={10}>
          {statCards.map((card) => (
            <Grid key={card.title} item xs={10} sm={5} md={2}>
              <Paper
                sx={{
                  p: 3,
                  background: card.gradient,
                  borderRadius: 4,
                  boxShadow: 'none',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease',
                  }
                }}
              >
                <Stack spacing={1}>
                  <IconifyIcon icon={card.icon} fontSize={32} sx={{ color: card.color }} />
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    {card.title}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="text.primary">
                    {card.value}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>Đơn hàng gần đây</Typography>
        {recentOrders.length === 0 ? (
          <Typography color="text.secondary">Chưa có đơn hàng nào</Typography>
        ) : (
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
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.User?.name || order.user_id || 'Ẩn danh'}</TableCell>
                    <TableCell>{order.note || 'Không có ghi chú'}</TableCell>
                    <TableCell color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {order.total?.toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          order.status === 0 ? 'Chờ xử lý' :
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Stack>
  );
};

export default AdminDashboard;
