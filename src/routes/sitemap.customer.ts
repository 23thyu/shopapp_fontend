import { MenuItem } from './sitemap';

const sitemapCustomer: MenuItem[] = [
  {
    id: 'customer-home',
    subheader: 'Cửa hàng',
    path: '/',
    icon: 'material-symbols:storefront-outline',
  },
  {
    id: 'customer-cart',
    subheader: 'Giỏ hàng',
    path: '/cart',
    icon: 'material-symbols:shopping-bag-outline',
  },
  {
    id: 'customer-orders',
    subheader: 'Đơn hàng của tôi',
    path: '/my-orders',
    icon: 'material-symbols:receipt-long-outline',
  },
  {
    id: 'customer-news',
    subheader: 'Tin tức',
    path: '/news-list',
    icon: 'material-symbols:newspaper-outline',
  },
  {
    id: 'customer-auth',
    subheader: 'Tài khoản',
    icon: 'material-symbols:account-circle-outline',
    items: [
      {
        name: 'Đăng nhập',
        pathName: 'signin',
        path: '/authentication/signin',
      },
      {
        name: 'Đăng ký',
        pathName: 'signup',
        path: '/authentication/signup',
      },
    ],
  },
];

export default sitemapCustomer;
