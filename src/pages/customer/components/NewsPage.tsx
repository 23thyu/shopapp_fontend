import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { api } from 'services/api';

const NewsPage = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

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

  const handleOpenArticle = (item: any) => {
    setSelectedArticle(item);
    setOpen(true);
  };

  if (loading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack p={4} spacing={4} width={1}>
      <Typography variant="h2" fontWeight="bold">Tin tức & Khuyến mãi</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {news.map((item) => (
          <Grid key={item.id} item xs={12} md={6} lg={4}>
            <Card
              onClick={() => handleOpenArticle(item)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                },
              }}
            >
              {item.image && (
                <CardMedia
                  component="img"
                  image={item.image}
                  alt={item.title}
                  sx={{ height: 200, objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" fontWeight="bold" mb={1} sx={{ lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Đăng ngày: {new Date(item.created_at || Date.now()).toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {news.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">Hiện tại chưa có bài viết tin tức nào được đăng tải.</Alert>
          </Grid>
        )}
      </Grid>

      {/* Read Article Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        {selectedArticle && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pt: 3 }}>
              {selectedArticle.title}
            </DialogTitle>
            <DialogContent dividers sx={{ pb: 4 }}>
              {selectedArticle.image && (
                <Box mb={3} sx={{ borderRadius: 3, overflow: 'hidden', maxHeight: 400, display: 'flex', justifyContent: 'center' }}>
                  <img src={selectedArticle.image} alt={selectedArticle.title} style={{ maxWidth: '100%', objectFit: 'cover' }} />
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                Đăng lúc: {new Date(selectedArticle.created_at || Date.now()).toLocaleString('vi-VN')}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {selectedArticle.content}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setOpen(false)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
};

export default NewsPage;
