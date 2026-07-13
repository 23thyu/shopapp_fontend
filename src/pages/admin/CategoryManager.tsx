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
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Image from 'components/base/Image';
import MediaSelector from 'components/base/MediaSelector';
import { api } from 'services/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '' });
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories('all');
      setCategories(Array.isArray(res) ? res : (res?.data || []));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh mục sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= categories.length) {
      setPage(Math.max(0, Math.ceil(categories.length / rowsPerPage) - 1));
    }
  }, [categories, page, rowsPerPage]);

  const handleOpenDialog = (category: any | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, image: category.image || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', image: '' });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      handleCloseDialog();
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có muốn xóa danh mục này?')) return;
    try {
      await api.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa danh mục');
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
        <Typography variant="h4" fontWeight="bold">Quản lý danh mục</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Thêm danh mục
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hình ảnh</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên danh mục</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    {category.image ? (
                      <Image src={category.image} alt={category.name} height={40} width={40} sx={{ objectFit: 'contain', borderRadius: 1 }} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">Không có ảnh</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{category.name}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small" onClick={() => handleOpenDialog(category)}>Sửa</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(category.id)}>Xóa</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">Chưa có danh mục nào</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={categories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack direction="column" spacing={3} mt={1}>
              <TextField
                label="Tên danh mục"
                fullWidth
                variant="filled"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <MediaSelector
                label="Hình ảnh danh mục"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                placeholder="Chọn hoặc nhập link ảnh danh mục"
                aspectRatio={1}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu lại'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
};

export default CategoryManager;
