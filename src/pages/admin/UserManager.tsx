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
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { api } from 'services/api';

const UserManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(Array.isArray(res) ? res : (res?.data || []));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách người dùng. Vui lòng kiểm tra quyền ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= users.length) {
      setPage(Math.max(0, Math.ceil(users.length / rowsPerPage) - 1));
    }
  }, [users, page, rowsPerPage]);

  const handleRoleChange = async (userId: number, currentRole: number) => {
    const nextRole = currentRole === 1 ? 2 : 1;
    if (!confirm(`Bạn có muốn thay đổi quyền hạn người dùng này sang ${nextRole === 2 ? 'ADMIN' : 'USER'}?`)) return;
    try {
      await api.updateProfile(userId, { role: nextRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật quyền hạn');
    }
  };

  const handleToggleLock = async (userId: number, currentLocked: number) => {
    const nextLocked = currentLocked === 1 ? 0 : 1;
    if (!confirm(`Bạn có muốn ${nextLocked === 1 ? 'KHOÁ' : 'MỞ KHOÁ'} tài khoản này?`)) return;
    try {
      await api.updateProfile(userId, { is_locked: nextLocked });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khoá tài khoản');
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
        <Typography variant="h4" fontWeight="bold">Quản lý người dùng</Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ảnh đại diện</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Họ và tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Quyền hạn</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Avatar src={user.avatar} sx={{ bgcolor: 'primary.light' }}>
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{user.name || 'Chưa cập nhật'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 2 ? 'ADMIN' : 'USER'}
                      color={user.role === 2 ? 'primary' : 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_locked === 1 ? 'Đã bị khóa' : 'Hoạt động'}
                      color={user.is_locked === 1 ? 'error' : 'success'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small" onClick={() => handleRoleChange(user.id, user.role)}>
                        Đổi vai trò
                      </Button>
                      <Button
                        variant="outlined"
                        color={user.is_locked === 1 ? 'success' : 'error'}
                        size="small"
                        onClick={() => handleToggleLock(user.id, user.is_locked)}
                      >
                        {user.is_locked === 1 ? 'Mở khoá' : 'Khoá'}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">Không tìm thấy người dùng nào</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Stack>
  );
};

export default UserManager;
