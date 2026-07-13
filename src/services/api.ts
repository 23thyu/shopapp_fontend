export const API_BASE_URL = 'https://shopapp-backend-spew.onrender.com/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type to application/json only if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const api = {
  // Auth
  login: (body: any) => request('/login-users', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: any) => request('/register-users', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (id: number, body: any) => request(`/users/${id}`, { method: 'POST', body: JSON.stringify(body) }),
  getUsers: () => request('/users'),

  // Products
  getProducts: (limit?: string) => request(`/products${limit ? `?limit=${limit}` : ''}`),
  getProductById: (id: number) => request(`/products/${id}`),
  createProduct: (body: any) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: number, body: any) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: number) => request(`/products/${id}`, { method: 'DELETE' }),

  // Product Variants (Sizes)
  getVariants: (productId: number) => request(`/products/${productId}/variants`),
  bulkSaveVariants: (productId: number, body: any) => request(`/products/${productId}/variants/bulk`, { method: 'POST', body: JSON.stringify(body) }),
  createVariant: (body: any) => request('/product-variants', { method: 'POST', body: JSON.stringify(body) }),
  updateVariant: (id: number, body: any) => request(`/product-variants/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteVariant: (id: number) => request(`/product-variants/${id}`, { method: 'DELETE' }),

  // Product Images
  getProductImages: (productId?: number) => request(`/product-images${productId ? `?product_id=${productId}` : ''}`),
  createProductImage: (body: any) => request('/product-images', { method: 'POST', body: JSON.stringify(body) }),
  deleteProductImage: (id: number) => request(`/product-images/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: (limit?: string) => request(`/categories${limit ? `?limit=${limit}` : ''}`),
  getCategoryById: (id: number) => request(`/categories/${id}`),
  createCategory: (body: any) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: number, body: any) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id: number) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Brands
  getBrands: () => request('/brands'),
  getBrandById: (id: number) => request(`/brands/${id}`),
  createBrand: (body: any) => request('/brands', { method: 'POST', body: JSON.stringify(body) }),
  updateBrand: (id: number, body: any) => request(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBrand: (id: number) => request(`/brands/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (limit?: string) => request(`/orders${limit ? `?limit=${limit}` : ''}`),
  getOrderById: (id: number) => request(`/orders/${id}`),
  createOrder: (body: any) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrder: (id: number, body: any) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteOrder: (id: number) => request(`/orders/${id}`, { method: 'DELETE' }),
  getOrderDetails: () => request('/order-details'),

  // Media Library
  getMedia: (limit?: string) => request(`/media${limit ? `?limit=${limit}` : ''}`),
  uploadMedia: (formData: FormData) => request('/media/upload', { method: 'POST', body: formData }),
  deleteMedia: (id: number) => request(`/media/${id}`, { method: 'DELETE' }),
  uploadImageCloudinary: (formData: FormData) => request('/images/cloudinary/upload', { method: 'POST', body: formData }),

  // Banners
  getBanners: (limit?: string) => request(`/banners${limit ? `?limit=${limit}` : ''}`),
  getBannerById: (id: number) => request(`/banners/${id}`),
  createBanner: (body: any) => request('/banners', { method: 'POST', body: JSON.stringify(body) }),
  updateBanner: (id: number, body: any) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBanner: (id: number) => request(`/banners/${id}`, { method: 'DELETE' }),

  // Banner Details
  getBannerDetails: () => request('/banner-details'),
  createBannerDetail: (body: any) => request('/banner-details', { method: 'POST', body: JSON.stringify(body) }),
  deleteBannerDetail: (id: number) => request(`/banner-details/${id}`, { method: 'DELETE' }),

  // News
  getNews: (limit?: string) => request(`/news${limit ? `?limit=${limit}` : ''}`),
  getNewsById: (id: number) => request(`/news/${id}`),
  createNews: (body: any) => request('/news', { method: 'POST', body: JSON.stringify(body) }),
  updateNews: (id: number, body: any) => request(`/news/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteNews: (id: number) => request(`/news/${id}`, { method: 'DELETE' }),

  // News Details
  getNewsDetails: () => request('/news-details'),
  createNewsDetail: (body: any) => request('/news-details', { method: 'POST', body: JSON.stringify(body) }),
  deleteNewsDetail: (id: number) => request(`/news-details/${id}`, { method: 'DELETE' }),

  // Carts
  getCarts: (userId?: number, sessionId?: string) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    if (sessionId) params.append('session_id', sessionId);
    return request(`/carts?${params.toString()}`);
  },
  createCart: (body: any) => request('/carts', { method: 'POST', body: JSON.stringify(body) }),
  checkoutCart: (body: any) => request('/carts/checkout', { method: 'POST', body: JSON.stringify(body) }),

  // Cart Items
  createCartItem: (body: any) => request('/cart-items', { method: 'POST', body: JSON.stringify(body) }),
  updateCartItem: (id: number, body: any) => request(`/cart-items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCartItem: (id: number) => request(`/cart-items/${id}`, { method: 'DELETE' }),

  // Utils
  getSessionId: () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch { return null; }
    }
    return null;
  }
};
