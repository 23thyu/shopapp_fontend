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

const NewsManager = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any | null>(null);
  const [formData, setFormData] = useState({ title: '', image: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchNews = async () => {
    try {
      const res = await api.getNews('all');
      setNews(Array.isArray(res) ? res : (res?.data || []));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= news.length) {
      setPage(Math.max(0, Math.ceil(news.length / rowsPerPage) - 1));
    }
  }, [news, page, rowsPerPage]);

  const handleOpenDialog = (item: any | null = null) => {
    if (item) {
      setEditingNews(item);
      setFormData({
        title: item.title,
        image: item.image || '',
        content: item.content || '',
      });
    } else {
      setEditingNews(null);
      setFormData({ title: '', image: '', content: '' });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingNews(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setSubmitting(true);
    try {
      if (editingNews) {
        await api.updateNews(editingNews.id, formData);
      } else {
        await api.createNews(formData);
      }
      handleCloseDialog();
      fetchNews();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có muốn xóa bài viết này?')) return;
    try {
      await api.deleteNews(id);
      fetchNews();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa bài viết');
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
        <Typography variant="h4" fontWeight="bold">Quản lý tin tức</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Viết bài mới
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
                <TableCell sx={{ fontWeight: 'bold' }}>Tiêu đề</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nội dung rút gọn</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    {item.image ? (
                      <Image src={item.image} alt={item.title} height={50} width={80} sx={{ objectFit: 'cover', borderRadius: 1 }} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">Không có ảnh</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</TableCell>
                  <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.content || 'Không có nội dung'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small" onClick={() => handleOpenDialog(item)}>Sửa</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(item.id)}>Xóa</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {news.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">Chưa có bài viết tin tức nào</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={news.length}
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
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingNews ? 'Chỉnh sửa bài viết tin tức' : 'Viết bài viết mới'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack direction="column" spacing={3} mt={1}>
              <TextField
                label="Tiêu đề bài viết"
                fullWidth
                variant="filled"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <MediaSelector
                label="Ảnh đại diện bài viết"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                placeholder="Chọn hoặc nhập link ảnh bài viết"
                aspectRatio={16 / 9}
              />
              <TextField
                label="Nội dung bài viết"
                fullWidth
                multiline
                rows={10}
                variant="filled"
                required
                value={formData.content}
                placeholder="Nhập nội dung chi tiết bài viết..."
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu bài viết'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
};

export default NewsManager;
