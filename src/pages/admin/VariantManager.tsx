import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconifyIcon from 'components/base/IconifyIcon';
import MediaSelector from 'components/base/MediaSelector';
import { api } from 'services/api';

interface AttributeConfig {
  name: string;
  values: string[];
  rawInput?: string;
  used_for_variants: boolean;
}

interface LocalVariant {
  id?: number;
  price: number | '';
  quantity: number;
  attributes: Record<string, string>;
  image?: string;
}

const PREDEFINED_ATTRIBUTES = ['Màu sắc', 'Kích cỡ', 'Dung lượng', 'RAM', 'Thương hiệu'];

const VariantManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  const [activeTab, setActiveTab] = useState(0); // 0: Attributes, 1: Variations
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Attributes tab states
  const [attributesConfig, setAttributesConfig] = useState<AttributeConfig[]>([]);
  const [selectedAttrToAdd, setSelectedAttrToAdd] = useState<string>('Màu sắc');
  const [customAttrToAdd, setCustomAttrToAdd] = useState<string>('');

  // Variations tab states
  const [variants, setVariants] = useState<LocalVariant[]>([]);
  const [variationAction, setVariationAction] = useState<string>('generate');

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts('all');
      const prods = Array.isArray(res) ? res : (res?.data || []);
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProductId(prods[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách sản phẩm');
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
      console.error('Lỗi tải danh mục', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryId === 'all' || p.category_id === selectedCategoryId;
    const matchesSearch =
      !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const fetchProductDetails = async (productId: number) => {
    setDetailLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.getProductById(productId);
      const prod = res?.data || res;
      setSelectedProduct(prod);

      // Parse Product Attributes Config
      let parsedConfig: AttributeConfig[] = [];
      if (prod?.attributes) {
        try {
          parsedConfig = typeof prod.attributes === 'string'
            ? JSON.parse(prod.attributes)
            : prod.attributes;
        } catch {
          parsedConfig = [];
        }
      }
      if (Array.isArray(parsedConfig)) {
        parsedConfig = parsedConfig.map((a: any) => ({
          ...a,
          rawInput: Array.isArray(a.values) ? a.values.join(', ') : ''
        }));
      }
      setAttributesConfig(Array.isArray(parsedConfig) ? parsedConfig : []);

      // Parse Variations
      const rawVariants = prod?.variants || [];
      const formattedVariants = rawVariants.map((v: any) => {
        const attributesObj: Record<string, string> = {};
        if (Array.isArray(v.details)) {
          v.details.forEach((d: any) => {
            attributesObj[d.attribute_name] = d.attribute_value;
          });
        }
        return {
          id: v.id,
          price: v.price !== null && v.price !== undefined ? v.price : '',
          quantity: v.quantity || 0,
          attributes: attributesObj,
          image: v.image || '',
        };
      });
      setVariants(formattedVariants);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải thông tin sản phẩm chi tiết');
    } finally {
      setDetailLoading(false);
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
      fetchProductDetails(Number(selectedProductId));
    } else {
      setSelectedProduct(null);
      setAttributesConfig([]);
      setVariants([]);
    }
  }, [selectedProductId]);

  // Tab 0 logic: Attribute Management
  const handleAddAttribute = () => {
    const attrName = selectedAttrToAdd === 'custom' ? customAttrToAdd.trim() : selectedAttrToAdd;
    if (!attrName) return;

    // Check if attribute already exists
    if (attributesConfig.some(a => a.name.toLowerCase() === attrName.toLowerCase())) {
      setError('Thuộc tính này đã được thêm.');
      return;
    }

    const newAttr: AttributeConfig = {
      name: attrName,
      values: [],
      rawInput: '',
      used_for_variants: true
    };

    setAttributesConfig([...attributesConfig, newAttr]);
    if (selectedAttrToAdd === 'custom') {
      setCustomAttrToAdd('');
    }
    setError('');
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributesConfig(attributesConfig.filter((_, i) => i !== index));
  };

  const handleAttributeValueChange = (index: number, textValue: string) => {
    const updated = [...attributesConfig];
    updated[index].rawInput = textValue;
    // Split by comma and trim
    updated[index].values = textValue.split(',').map(v => v.trim()).filter(v => v !== '');
    setAttributesConfig(updated);
  };

  const handleAttributeCheckboxChange = (index: number, checked: boolean) => {
    const updated = [...attributesConfig];
    updated[index].used_for_variants = checked;
    setAttributesConfig(updated);
  };

  const handleSaveAttributes = async () => {
    if (selectedProductId === '') return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.updateProduct(Number(selectedProductId), {
        attributes: attributesConfig
      });
      setSuccess('Đã lưu thuộc tính thành công!');
      fetchProductDetails(Number(selectedProductId));
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu thuộc tính');
    } finally {
      setSubmitting(false);
    }
  };

  // Tab 1 logic: Variations Management
  const generateCartesianProduct = () => {
    // Get attributes configured for variations with values
    const activeAttrs = attributesConfig.filter(a => a.used_for_variants && a.values.length > 0);
    if (activeAttrs.length === 0) {
      setError('Hãy cấu hình thuộc tính dùng cho biến thể và nhập giá trị trước ở tab Các thuộc tính.');
      return;
    }

    // Helper for combinations
    let combinations: Record<string, string>[] = [{}];
    for (const attr of activeAttrs) {
      const temp: Record<string, string>[] = [];
      for (const comb of combinations) {
        for (const val of attr.values) {
          temp.push({
            ...comb,
            [attr.name]: val
          });
        }
      }
      combinations = temp;
    }

    // Create new local variant objects
    const newVariants: LocalVariant[] = combinations.map(comb => {
      // Find if we already have a variant with this combination
      const match = variants.find(v => {
        const keys = Object.keys(comb);
        return keys.length === Object.keys(v.attributes).length &&
          keys.every(k => v.attributes[k] === comb[k]);
      });

      if (match) {
        return match; // keep existing if matched
      }

      return {
        price: '',
        quantity: 0,
        attributes: comb,
        image: '',
      };
    });

    setVariants(newVariants);
    setSuccess(`Đã tạo nháp ${newVariants.length} biến thể kết hợp. Hãy bấm "Lưu thay đổi" để xác nhận.`);
  };

  const handleExecuteVariationAction = () => {
    if (variationAction === 'generate') {
      generateCartesianProduct();
    } else {
      // Add empty variant
      const emptyAttr: Record<string, string> = {};
      attributesConfig.forEach(a => {
        if (a.used_for_variants && a.values.length > 0) {
          emptyAttr[a.name] = a.values[0];
        }
      });
      setVariants([...variants, { price: '', quantity: 0, attributes: emptyAttr, image: '' }]);
    }
  };

  const handleRemoveLocalVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleLocalVariantChange = (index: number, field: 'price' | 'quantity', value: any) => {
    const updated = [...variants];
    if (field === 'price') {
      updated[index].price = value === '' ? '' : Number(value);
    } else {
      updated[index].quantity = Number(value);
    }
    setVariants(updated);
  };

  const handleLocalVariantAttrValueChange = (vIndex: number, attrName: string, attrVal: string) => {
    const updated = [...variants];
    updated[vIndex].attributes[attrName] = attrVal;
    setVariants(updated);
  };

  const handleSaveVariants = async () => {
    if (selectedProductId === '') return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = variants.map(v => ({
        id: v.id || null,
        price: v.price === '' ? null : Number(v.price),
        quantity: Number(v.quantity) || 0,
        attributes: v.attributes,
        image: v.image || null,
      }));

      await api.bulkSaveVariants(Number(selectedProductId), { variants: payload });
      setSuccess(`Đã lưu biến thể thành công, tạo ra được ${variants.length} biến thể`);
      fetchProductDetails(Number(selectedProductId));
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu biến thể');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Stack direction="column" minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack direction="column" p={4} spacing={4} width={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">Quản lý thuộc tính & Biến thể</Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

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

          <FormControl sx={{ minWidth: 350 }} variant="filled">
            <InputLabel id="select-product-label">Chọn sản phẩm</InputLabel>
            <Select
              labelId="select-product-label"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value as number)}
            >
              {filteredProducts.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {selectedProductId === '' ? (
          <Alert severity="info">Vui lòng chọn sản phẩm để bắt đầu quản lý.</Alert>
        ) : detailLoading ? (
          <Stack direction="column" py={6} alignItems="center" justifyContent="center">
            <CircularProgress />
            <Typography mt={2} color="text.secondary">Đang tải thông tin sản phẩm...</Typography>
          </Stack>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                <Tab label="1. Các thuộc tính" sx={{ fontWeight: 'bold' }} />
                <Tab label="2. Các biến thể" sx={{ fontWeight: 'bold' }} />
              </Tabs>
            </Box>

            {/* TAB 0: Attributes Config */}
            {activeTab === 0 && (
              <Stack direction="column" spacing={4}>
                <Typography variant="h5" fontWeight="bold">Cấu hình thuộc tính sản phẩm</Typography>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel id="add-attr-label">Chọn thuộc tính</InputLabel>
                    <Select
                      labelId="add-attr-label"
                      value={selectedAttrToAdd}
                      label="Chọn thuộc tính"
                      onChange={(e) => setSelectedAttrToAdd(e.target.value)}
                    >
                      {PREDEFINED_ATTRIBUTES.map(attr => (
                        <MenuItem key={attr} value={attr}>{attr}</MenuItem>
                      ))}
                      <MenuItem value="custom">-- Thuộc tính tự nhập --</MenuItem>
                    </Select>
                  </FormControl>

                  {selectedAttrToAdd === 'custom' && (
                    <TextField
                      label="Nhập tên thuộc tính mới"
                      value={customAttrToAdd}
                      onChange={(e) => setCustomAttrToAdd(e.target.value)}
                    />
                  )}

                  <Button variant="contained" onClick={handleAddAttribute} startIcon={<IconifyIcon icon="material-symbols:add" />}>
                    Thêm
                  </Button>
                </Stack>

                <Stack direction="column" spacing={3}>
                  {attributesConfig.map((attr, index) => (
                    <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                              {attr.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Các giá trị (Cách nhau bằng dấu phẩy)"
                              fullWidth
                              placeholder="Đỏ, Vàng, Xanh dương..."
                              variant="outlined"
                              value={attr.rawInput ?? attr.values.join(', ')}
                              onChange={(e) => handleAttributeValueChange(index, e.target.value)}
                              helperText="Ví dụ: Đỏ, Vàng (ngăn cách bằng dấu phẩy)"
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={attr.used_for_variants}
                                  onChange={(e) => handleAttributeCheckboxChange(index, e.target.checked)}
                                />
                              }
                              label="Dùng cho biến thể"
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} sx={{ textAlign: 'right' }}>
                            <IconButton color="error" onClick={() => handleRemoveAttribute(index)}>
                              <IconifyIcon icon="material-symbols:delete-outline" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}

                  {attributesConfig.length === 0 && (
                    <Alert severity="info">Chưa cấu hình thuộc tính nào. Hãy chọn thuộc tính ở trên để thêm.</Alert>
                  )}
                </Stack>

                <Box alignSelf="flex-start" mt={2}>
                  <Button variant="contained" size="large" onClick={handleSaveAttributes} disabled={submitting}>
                    {submitting ? 'Đang lưu...' : 'Lưu thuộc tính'}
                  </Button>
                </Box>
              </Stack>
            )}

            {/* TAB 1: Variations list and Cartesian generator */}
            {activeTab === 1 && (
              <Stack direction="column" spacing={4}>
                <Typography variant="h5" fontWeight="bold">Các biến thể sản phẩm</Typography>

                {/* Phần tạo biến thể & Nhập hàng loạt */}
                <Grid container spacing={3} alignItems="center" bgcolor="action.hover" p={2} borderRadius={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="action-select-label">Tác vụ</InputLabel>
                      <Select
                        labelId="action-select-label"
                        value={variationAction}
                        label="Tác vụ"
                        onChange={(e) => setVariationAction(e.target.value)}
                      >
                        <MenuItem value="generate">Tạo biến thể từ tất cả thuộc tính</MenuItem>
                        <MenuItem value="add_manual">Thêm biến thể thủ công</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button variant="contained" color="primary" onClick={handleExecuteVariationAction} fullWidth size="medium">
                      Chạy tác vụ
                    </Button>
                  </Grid>

                  {/* Bulk edit inputs */}
                  {variants.length > 0 && (
                    <>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Giá áp dụng chung"
                          type="number"
                          size="small"
                          fullWidth
                          id="bulk-price-input"
                          placeholder="Ví dụ: 150000"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Kho áp dụng chung"
                          type="number"
                          size="small"
                          fullWidth
                          id="bulk-qty-input"
                          placeholder="Ví dụ: 50"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={() => {
                            const bulkPriceStr = (document.getElementById('bulk-price-input') as HTMLInputElement)?.value;
                            const bulkQtyStr = (document.getElementById('bulk-qty-input') as HTMLInputElement)?.value;
                            
                            const updated = variants.map(v => ({
                              ...v,
                              price: bulkPriceStr !== '' && bulkPriceStr !== undefined ? Number(bulkPriceStr) : v.price,
                              quantity: bulkQtyStr !== '' && bulkQtyStr !== undefined ? Number(bulkQtyStr) : v.quantity
                            }));
                            setVariants(updated);
                            setSuccess('Đã áp dụng giá trị hàng loạt thành công!');
                          }}
                        >
                          Áp dụng nhanh
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>

                {/* Danh sách biến thể bằng dạng Bảng */}
                {variants.length > 0 ? (
                  <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #E0E0E0', textAlign: 'left', backgroundColor: '#F5F5F5' }}>
                          <th style={{ padding: '12px 8px', width: '60px' }}>STT</th>
                          <th style={{ padding: '12px 8px', width: '80px' }}>Hình ảnh</th>
                          <th style={{ padding: '12px 8px' }}>Các thuộc tính</th>
                          <th style={{ padding: '12px 8px', width: '220px' }}>Giá trị cụ thể</th>
                          <th style={{ padding: '12px 8px', width: '180px' }}>Giá override (Nếu có)</th>
                          <th style={{ padding: '12px 8px', width: '150px' }}>Số lượng kho</th>
                          <th style={{ padding: '12px 8px', width: '80px', textAlign: 'center' }}>Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, vIndex) => {
                          const attrText = Object.entries(v.attributes)
                            .map(([k, val]) => `${k}: ${val}`)
                            .join(', ');

                          return (
                            <tr key={vIndex} style={{ borderBottom: '1px solid #E0E0E0' }}>
                              <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>#{vIndex + 1}</td>
                              <td style={{ padding: '12px 8px' }}>
                                <MediaSelector
                                  compact
                                  label="Ảnh biến thể"
                                  value={v.image || ''}
                                  onChange={(url) => {
                                    const updated = [...variants];
                                    updated[vIndex].image = url;
                                    setVariants(updated);
                                  }}
                                  aspectRatio={1}
                                />
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {attrText || 'Biến thể mặc định'}
                                </Typography>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {Object.keys(v.attributes).length > 0 && (
                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {Object.keys(v.attributes).map(key => {
                                      const cfg = attributesConfig.find(c => c.name === key);
                                      const valuesList = cfg ? cfg.values : [];
                                      return (
                                        <FormControl key={key} size="small" sx={{ minWidth: 90, my: 0.5 }}>
                                          <Select
                                            value={v.attributes[key]}
                                            onChange={(e) => handleLocalVariantAttrValueChange(vIndex, key, e.target.value)}
                                            displayEmpty
                                            sx={{ fontSize: '0.85rem' }}
                                          >
                                            {valuesList.map(opt => (
                                              <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>{opt}</MenuItem>
                                            ))}
                                            {!valuesList.includes(v.attributes[key]) && (
                                              <MenuItem value={v.attributes[key]} sx={{ fontSize: '0.85rem' }}>{v.attributes[key]}</MenuItem>
                                            )}
                                          </Select>
                                        </FormControl>
                                      );
                                    })}
                                  </Stack>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <TextField
                                  type="number"
                                  size="small"
                                  fullWidth
                                  placeholder="Giá gốc"
                                  value={v.price}
                                  onChange={(e) => handleLocalVariantChange(vIndex, 'price', e.target.value)}
                                  inputProps={{ style: { fontSize: '0.85rem' } }}
                                />
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <TextField
                                  type="number"
                                  size="small"
                                  required
                                  fullWidth
                                  value={v.quantity}
                                  onChange={(e) => handleLocalVariantChange(vIndex, 'quantity', e.target.value)}
                                  inputProps={{ style: { fontSize: '0.85rem' } }}
                                />
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                <IconButton color="error" size="small" onClick={() => handleRemoveLocalVariant(vIndex)}>
                                  <IconifyIcon icon="material-symbols:delete-outline" />
                                </IconButton>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Alert severity="info">
                    Chưa có biến thể nào cho sản phẩm này. Hãy chọn "Tạo biến thể từ tất cả thuộc tính" ở trên để sinh tự động.
                  </Alert>
                )}

                <Box alignSelf="flex-start" mt={4}>
                  <Button variant="contained" size="large" onClick={handleSaveVariants} disabled={submitting}>
                    {submitting ? 'Đang lưu biến thể...' : 'Lưu thay đổi'}
                  </Button>
                </Box>
              </Stack>
            )}
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default VariantManager;
