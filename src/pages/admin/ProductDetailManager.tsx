import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import IconifyIcon from 'components/base/IconifyIcon';
import MediaSelector from 'components/base/MediaSelector';
import { api } from 'services/api';

const ProductDetailManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  
  const [description, setDescription] = useState('');
  const [specification, setSpecification] = useState('');
  const [productImages, setProductImages] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submittingSpecs, setSubmittingSpecs] = useState(false);
  const [addingImage, setAddingImage] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts('all');
      const prods = Array.isArray(res) ? res : (res?.data || []);
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProductId(prods[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories('all');
      const cats = Array.isArray(res) ? res : (res?.data || []);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryId === 'all' || p.category_id === selectedCategoryId;
    const matchesSearch =
      !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const fetchDetails = async (productId: number) => {
    setDetailsLoading(true);
    try {
      // Get product info
      const prod = await api.getProductById(productId);
      const product = prod?.data || prod;
      setDescription(product.description || '');
      setSpecification(product.specification || '');

      // Get only images for this product (filtered from server)
      const imgs = await api.getProductImages(productId);
      const imageList = Array.isArray(imgs) ? imgs : (imgs?.data || []);
      setProductImages(imageList);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      const isStillInList = filteredProducts.some(p => p.id === selectedProductId);
      if (!isStillInList) {
        setSelectedProductId(filteredProducts[0].id);
      }
    } else {
      setSelectedProductId('');
    }
  }, [selectedCategoryId, productSearchQuery, products]);

  useEffect(() => {
    if (selectedProductId !== '') {
      fetchDetails(Number(selectedProductId));
    }
  }, [selectedProductId]);

  const handleSaveDetails = async () => {
    if (selectedProductId === '') return;
    setSubmittingSpecs(true);
    try {
      await api.updateProduct(Number(selectedProductId), {
        description,
        specification,
      });
      alert('Đã lưu mô tả và thông số kỹ thuật sản phẩm!');
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật chi tiết');
    } finally {
      setSubmittingSpecs(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || selectedProductId === '') return;
    setAddingImage(true);
    try {
      const urls = newImageUrl.split(',').map(url => url.trim()).filter(Boolean);
      
      // Save all images concurrently in database
      const savePromises = urls.map(url => 
        api.createProductImage({
          product_id: Number(selectedProductId),
          image_url: url,
        })
      );
      
      await Promise.all(savePromises);
      setNewImageUrl('');
      fetchDetails(Number(selectedProductId));
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm ảnh phụ');
    } finally {
      setAddingImage(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Bạn có muốn xóa hình ảnh này khỏi thư viện ảnh sản phẩm?')) return;
    try {
      await api.deleteProductImage(id);
      if (selectedProductId !== '') {
        fetchDetails(Number(selectedProductId));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa ảnh');
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
        <Typography variant="h4" fontWeight="bold">Quản lý chi tiết sản phẩm</Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={4}>
          <FormControl sx={{ minWidth: 200 }} variant="filled">
            <InputLabel id="category-select-label">Lọc theo danh mục</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value as number | 'all')}
            >
              <MenuItem value="all">Tất cả danh mục</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Tìm kiếm sản phẩm"
            variant="filled"
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          <FormControl sx={{ minWidth: 300 }} variant="filled">
            <InputLabel id="product-select-label">Chọn sản phẩm</InputLabel>
            <Select
              labelId="product-select-label"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value as number)}
            >
              {filteredProducts.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {detailsLoading ? (
          <Stack py={8} alignItems="center">
            <CircularProgress />
          </Stack>
        ) : (
          <Grid container spacing={4}>
            {/* Left: specifications and description */}
            <Grid item xs={12} md={7}>
              <Stack direction="column" spacing={3}>
                <Typography variant="h4" fontWeight="bold">Nội dung chi tiết</Typography>
                <TextField
                  label="Mô tả chi tiết"
                  fullWidth
                  multiline
                  rows={6}
                  variant="filled"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                  label="Thông số kỹ thuật"
                  fullWidth
                  multiline
                  rows={6}
                  variant="filled"
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                />
                <Button variant="contained" onClick={handleSaveDetails} disabled={submittingSpecs} sx={{ alignSelf: 'flex-start' }}>
                  {submittingSpecs ? 'Đang lưu...' : 'Lưu nội dung chi tiết'}
                </Button>
              </Stack>
            </Grid>

            {/* Right: photo gallery */}
            <Grid item xs={12} md={5}>
              <Stack direction="column" spacing={3}>
                <Typography variant="h4" fontWeight="bold">Bộ sưu tập ảnh phụ (Product Images)</Typography>

                <form onSubmit={handleAddImage}>
                  <Stack direction="column" spacing={2} width={1}>
                    <MediaSelector
                      label="Thêm ảnh phụ mới"
                      value={newImageUrl}
                      onChange={(url) => setNewImageUrl(url)}
                      placeholder="Chọn hoặc nhập link ảnh phụ"
                      aspectRatio={1}
                      allowMultiple={true}
                    />
                    <Button type="submit" variant="contained" disabled={addingImage || !newImageUrl.trim()} sx={{ alignSelf: 'flex-end' }}>
                      Thêm vào bộ sưu tập
                    </Button>
                  </Stack>
                </form>

                <Grid container spacing={2}>
                  {productImages.map((img) => (
                    <Grid key={img.id} item xs={6} sm={4}>
                      <Card sx={{ position: 'relative', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
                        <CardMedia
                          component="img"
                          image={img.image_url}
                          alt="product details"
                          sx={{ height: 110, objectFit: 'cover' }}
                        />
                        <CardActions sx={{ justifyContent: 'flex-end', p: 0.5, bgcolor: 'info.lighter' }}>
                          <IconButton size="small" color="error" onClick={() => handleDeleteImage(img.id)}>
                            <IconifyIcon icon="material-symbols:delete-outline" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                  {productImages.length === 0 && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" align="center">Chưa có ảnh phụ nào</Typography>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Stack>
  );
};

export default ProductDetailManager;
