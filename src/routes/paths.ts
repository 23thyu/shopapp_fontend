export const rootPaths = {
  root: '/',
  adminRoot: 'admin',
  authRoot: 'authentication',
  errorRoot: 'error',
};

export default {
  // Customer paths
  home: '/',
  cart: '/cart',
  myOrders: '/my-orders',
  newsList: '/news-list',
  support: '/support',

  // Admin paths
  adminDashboard: `/${rootPaths.adminRoot}/dashboard`,
  adminOrders: `/${rootPaths.adminRoot}/orders`,
  adminStore: `/${rootPaths.adminRoot}/store`,
  adminBrands: `/${rootPaths.adminRoot}/brands`,
  adminCategories: `/${rootPaths.adminRoot}/categories`,
  adminProducts: `/${rootPaths.adminRoot}/products`,
  adminVariants: `/${rootPaths.adminRoot}/products/variants`,
  adminUsers: `/${rootPaths.adminRoot}/users`,
  adminMedia: `/${rootPaths.adminRoot}/media`,
  adminBanners: `/${rootPaths.adminRoot}/banners`,
  adminProductDetails: `/${rootPaths.adminRoot}/product-details`,
  adminNews: `/${rootPaths.adminRoot}/news`,

  // Auth paths
  signin: `/${rootPaths.authRoot}/signin`,
  signup: `/${rootPaths.authRoot}/signup`,
  forgotPassword: `/${rootPaths.authRoot}/forgot-password`,
  404: `/${rootPaths.errorRoot}/404`,
};
