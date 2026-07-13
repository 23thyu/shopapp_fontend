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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Image from 'components/base/Image';
import MediaSelector from 'components/base/MediaSelector';
import { api } from 'services/api';

const ProductManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    price: 0,
    oldprice: 0,
    description: '',
    specification: '',
    quantity: 0,
    brand_id: '',
    category_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'all'>('all');

  const filteredProducts = products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || product.category_id === Number(selectedCategoryFilter);
    return matchesName && matchesCategory;
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.getProducts('all'),
        api.getCategories(),
        api.getBrands(),
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
      setCategories(Array.isArray(catRes) ? catRes : (catRes?.data || []));
      setBrands(Array.isArray(brandRes) ? brandRes : (brandRes?.data || []));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filteredProducts.length) {
      setPage(Math.max(0, Math.ceil(filteredProducts.length / rowsPerPage) - 1));
    }
  }, [filteredProducts, page, rowsPerPage]);

  const handleOpenDialog = (product: any | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        image: product.image || '',
        price: product.price || 0,
        oldprice: product.oldprice || 0,
        description: product.description || '',
        specification: product.specification || '',
        quantity: product.quantity || 0,
        brand_id: String(product.brand_id),
        category_id: String(product.category_id),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        image: '',
        price: 0,
        oldprice: 0,
        description: '',
        specification: '',
        quantity: 0,
        brand_id: brands[0]?.id ? String(brands[0].id) : '',
        category_id: categories[0]?.id ? String(categories[0].id) : '',
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand_id || !formData.category_id) return;
    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        price: Number(formData.price),
        oldprice: Number(formData.oldprice),
        quantity: Number(formData.quantity),
        brand_id: Number(formData.brand_id),
        category_id: Number(formData.category_id),
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, dataToSubmit);
      } else {
        await api.createProduct(dataToSubmit);
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có muốn xóa sản phẩm này?')) return;
    try {
      await api.deleteProduct(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa sản phẩm');
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
        <Typography variant="h4" fontWeight="bold">Quản lý sản phẩm</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Thêm sản phẩm
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        {/* Filters bar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Tìm kiếm sản phẩm theo tên"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="category-filter-label">Danh mục</InputLabel>
            <Select
              labelId="category-filter-label"
              value={selectedCategoryFilter}
              label="Danh mục"
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value as any);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tất cả danh mục</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ảnh</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên sản phẩm</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Giá</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kho</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Danh mục</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Thương hiệu</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
                const category = categories.find((c) => c.id === product.category_id);
                const brand = brands.find((b) => b.id === product.brand_id);
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      {product.image ? (
                        <Image src={product.image} alt={product.name} height={40} width={40} sx={{ objectFit: 'contain', borderRadius: 1 }} />
                      ) : (
                        <Typography variant="caption" color="text.secondary">No Image</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {product.price?.toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell>{product.quantity || 0}</TableCell>
                    <TableCell>{category?.name || product.category_id}</TableCell>
                    <TableCell>{brand?.name || product.brand_id}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button variant="outlined" size="small" onClick={() => handleOpenDialog(product)}>Sửa</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(product.id)}>Xóa</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">Chưa có sản phẩm nào</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
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
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack direction="column" spacing={3} mt={1}>
              <TextField
                label="Tên sản phẩm"
                fullWidth
                variant="filled"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <MediaSelector
                label="Hình ảnh chính của sản phẩm"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                placeholder="Chọn hoặc nhập link ảnh sản phẩm"
                aspectRatio={1}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Giá hiện tại (đ)"
                  type="number"
                  fullWidth
                  variant="filled"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
                <TextField
                  label="Giá cũ (đ)"
                  type="number"
                  fullWidth
                  variant="filled"
                  value={formData.oldprice}
                  onChange={(e) => setFormData({ ...formData, oldprice: Number(e.target.value) })}
                />
              </Stack>
              <TextField
                label="Số lượng trong kho"
                type="number"
                fullWidth
                variant="filled"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth variant="filled">
                  <InputLabel id="category-label">Danh mục</InputLabel>
                  <Select
                    labelId="category-label"
                    value={formData.category_id}
                    required
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant="filled">
                  <InputLabel id="brand-label">Thương hiệu</InputLabel>
                  <Select
                    labelId="brand-label"
                    value={formData.brand_id}
                    required
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  >
                    {brands.map((b) => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <TextField
                label="Mô tả sản phẩm"
                fullWidth
                multiline
                rows={3}
                variant="filled"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                label="Thông số kỹ thuật"
                fullWidth
                multiline
                rows={3}
                variant="filled"
                placeholder="Ví dụ: RAM 8GB, ROM 256GB"
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
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

export default ProductManager;
