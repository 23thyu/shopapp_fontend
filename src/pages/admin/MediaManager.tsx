import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import IconifyIcon from 'components/base/IconifyIcon';
import Snackbar from '@mui/material/Snackbar';
import TablePagination from '@mui/material/TablePagination';
import { api } from 'services/api';

const MediaManager = () => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const fetchMedia = async () => {
    try {
      const res = await api.getMedia('all');
      setMediaList(Array.isArray(res) ? res : (res?.data || []));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải thư viện media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= mediaList.length) {
      setPage(Math.max(0, Math.ceil(mediaList.length / rowsPerPage) - 1));
    }
  }, [mediaList, page, rowsPerPage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    setUploading(true);
    try {
      await api.uploadMedia(formData);
      setToastMessage('Tải hình ảnh lên thành công!');
      setToastOpen(true);
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi tải ảnh lên Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có muốn xóa hình ảnh này khỏi thư viện?')) return;
    try {
      await api.deleteMedia(id);
      setToastMessage('Đã xóa hình ảnh!');
      setToastOpen(true);
      fetchMedia();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa hình ảnh');
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setToastMessage('Đã copy đường dẫn ảnh!');
    setToastOpen(true);
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
        <Typography variant="h4" fontWeight="bold">Thư viện Media</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {uploading && <CircularProgress size={24} />}
          <Button variant="contained" component="label" disabled={uploading}>
            Tải ảnh lên
            <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        {mediaList.length === 0 ? (
          <Stack py={8} alignItems="center" justifyContent="center">
            <IconifyIcon icon="material-symbols:photo-library-outline" fontSize={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">Chưa có hình ảnh nào trong thư viện</Typography>
          </Stack>
        ) : (
          <>
            <Grid container spacing={3}>
              {mediaList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                    <CardMedia
                      component="img"
                      image={item.image_url || item.url}
                      alt="media"
                      sx={{ height: 200, objectFit: 'cover' }}
                    />
                    <CardActions sx={{ justifyContent: 'space-between', bgcolor: 'info.lighter', p: 1.5 }}>
                      <IconButton size="small" color="primary" onClick={() => handleCopyLink(item.image_url || item.url)}>
                        <IconifyIcon icon="material-symbols:content-copy-outline" />
                      </IconButton>
                      <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                        ID: #{item.id}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <IconifyIcon icon="material-symbols:delete-outline" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <TablePagination
              rowsPerPageOptions={[12, 24, 48]}
              component="div"
              count={mediaList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ mt: 3 }}
            />
          </>
        )}
      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
      />
    </Stack>
  );
};

export default MediaManager;
