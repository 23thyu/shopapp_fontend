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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Image from 'components/base/Image';
import MediaSelector from 'components/base/MediaSelector';
import { api } from 'services/api';

const BannerManager = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '', status: 1 });
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchBanners = async () => {
    try {
      const res = await api.getBanners('all');
      setBanners(Array.isArray(res) ? res : (res?.data || []));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= banners.length) {
      setPage(Math.max(0, Math.ceil(banners.length / rowsPerPage) - 1));
    }
  }, [banners, page, rowsPerPage]);

  const handleOpenDialog = (banner: any | null = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        name: banner.name,
        image: banner.image || '',
        status: banner.status ?? 1,
      });
    } else {
      setEditingBanner(null);
      setFormData({ name: '', image: '', status: 1 });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        status: Number(formData.status),
      };

      if (editingBanner) {
        await api.updateBanner(editingBanner.id, dataToSubmit);
      } else {
        await api.createBanner(dataToSubmit);
      }
      handleCloseDialog();
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có muốn xóa banner này?')) return;
    try {
      await api.deleteBanner(id);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa banner');
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
        <Typography variant="h4" fontWeight="bold">Quản lý banner</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Thêm Banner
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hình ảnh banner</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên Banner / Chiến dịch</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((banner) => (
                <TableRow key={banner.id} hover>
                  <TableCell>{banner.id}</TableCell>
                  <TableCell>
                    {banner.image ? (
                      <Image src={banner.image} alt={banner.name} height={60} width={150} sx={{ objectFit: 'cover', borderRadius: 2 }} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">Chưa có ảnh</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{banner.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={banner.status === 1 ? 'Kích hoạt' : 'Tắt'}
                      color={banner.status === 1 ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small" onClick={() => handleOpenDialog(banner)}>Sửa</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(banner.id)}>Xóa</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">Chưa có banner quảng cáo nào</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={banners.length}
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
          {editingBanner ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack direction="column" spacing={3} mt={1}>
              <TextField
                label="Tên banner / Chiến dịch"
                fullWidth
                variant="filled"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <MediaSelector
                label="Hình ảnh banner"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                placeholder="Chọn hoặc nhập link ảnh banner"
                aspectRatio={3}
              />
              <FormControl fullWidth variant="filled">
                <InputLabel id="banner-status-label">Trạng thái</InputLabel>
                <Select
                  labelId="banner-status-label"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                >
                  <MenuItem value={1}>Kích hoạt</MenuItem>
                  <MenuItem value={0}>Tắt</MenuItem>
                </Select>
              </FormControl>
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

export default BannerManager;
