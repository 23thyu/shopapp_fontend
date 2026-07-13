import { MenuItem } from './sitemap';

const sitemapAdmin: MenuItem[] = [
  {
    id: 'admin-dashboard',
    subheader: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'material-symbols:dashboard-outline',
  },
  {
    id: 'view-storefront',
    subheader: 'Xem Trang Chủ Khách',
    path: '/',
    icon: 'material-symbols:open-in-new',
  },
  {
    id: 'admin-orders',
    subheader: 'Quản lý đơn hàng',
    path: '/admin/orders',
    icon: 'material-symbols:shopping-cart-outline',
  },
  {
    id: 'admin-store',
    subheader: 'Quản lý cửa hàng',
    path: '/admin/store',
    icon: 'material-symbols:storefront-outline',
  },
  {
    id: 'admin-brands',
    subheader: 'Quản lý thương hiệu',
    path: '/admin/brands',
    icon: 'material-symbols:sell-outline',
  },
  {
    id: 'admin-categories',
    subheader: 'Quản lý danh mục',
    path: '/admin/categories',
    icon: 'material-symbols:folder-open-outline',
  },
  {
    id: 'admin-products-group',
    subheader: 'Quản lý sản phẩm',
    icon: 'material-symbols:package-2-outline',
    items: [
      {
        name: 'Danh sách sản phẩm',
        pathName: 'products-list',
        path: '/admin/products',
      },
      {
        name: 'Quản lý biến thể',
        pathName: 'products-variants',
        path: '/admin/products/variants',
      },
      {
        name: 'Chi tiết sản phẩm',
        pathName: 'product-details',
        path: '/admin/product-details',
      },
    ],
  },
  {
    id: 'admin-users',
    subheader: 'Quản lý người dùng',
    path: '/admin/users',
    icon: 'material-symbols:group-outline',
  },
  {
    id: 'admin-media',
    subheader: 'Quản lý Media',
    path: '/admin/media',
    icon: 'material-symbols:image-outline',
  },
  {
    id: 'admin-banners',
    subheader: 'Quản lý banner',
    path: '/admin/banners',
    icon: 'material-symbols:photo-library-outline',
  },
  {
    id: 'admin-news',
    subheader: 'Quản lý tin tức',
    path: '/admin/news',
    icon: 'material-symbols:newspaper-outline',
  },
];

export default sitemapAdmin;
