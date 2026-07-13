import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router';
import paths, { rootPaths } from './paths';
import MainLayout from 'layouts/main-layout';
import AuthLayout from 'layouts/auth-layout';
import Splash from 'components/loader/Splash';
import PageLoader from 'components/loader/PageLoader';
import Signin from 'pages/authentication/Signin';
import Signup from 'pages/authentication/Signup';
import Error404 from 'pages/Error404';

const App = lazy(() => import('App'));

// Admin pages
const AdminDashboard = lazy(() => import('pages/admin/AdminDashboard'));
const OrderManager = lazy(() => import('pages/admin/OrderManager'));
const StoreManager = lazy(() => import('pages/admin/StoreManager'));
const BrandManager = lazy(() => import('pages/admin/BrandManager'));
const CategoryManager = lazy(() => import('pages/admin/CategoryManager'));
const ProductManager = lazy(() => import('pages/admin/ProductManager'));
const VariantManager = lazy(() => import('pages/admin/VariantManager'));
const UserManager = lazy(() => import('pages/admin/UserManager'));
const MediaManager = lazy(() => import('pages/admin/MediaManager'));
const BannerManager = lazy(() => import('pages/admin/BannerManager'));
const ProductDetailManager = lazy(() => import('pages/admin/ProductDetailManager'));
const NewsManager = lazy(() => import('pages/admin/NewsManager'));

// Customer pages
const Storefront = lazy(() => import('pages/customer/components/Storefront'));
const ProductDetail = lazy(() => import('pages/customer/components/ProductDetail'));
const CartPage = lazy(() => import('pages/customer/components/CartPage'));
const MyOrdersPage = lazy(() => import('pages/customer/components/MyOrdersPage'));
const NewsPage = lazy(() => import('pages/customer/components/NewsPage'));
const SupportPage = lazy(() => import('pages/customer/components/SupportPage'));

const router = createBrowserRouter(
  [
    {
      element: (
        <Suspense fallback={<Splash />}>
          <App />
        </Suspense>
      ),
      children: [
        {
          path: rootPaths.root,
          element: (
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          ),
          children: [
            {
              index: true,
              element: <Storefront />,
            },
            {
              path: 'products/:id',
              element: <ProductDetail />,
            },
            {
              path: 'cart',
              element: <CartPage />,
            },
            {
              path: 'my-orders',
              element: <MyOrdersPage />,
            },
            {
              path: 'news-list',
              element: <NewsPage />,
            },
            {
              path: 'support',
              element: <SupportPage />,
            },
          ],
        },
        {
          path: rootPaths.adminRoot,
          element: (
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          ),
          children: [
            {
              path: 'dashboard',
              element: <AdminDashboard />,
            },
            {
              path: 'orders',
              element: <OrderManager />,
            },
            {
              path: 'store',
              element: <StoreManager />,
            },
            {
              path: 'brands',
              element: <BrandManager />,
            },
            {
              path: 'categories',
              element: <CategoryManager />,
            },
            {
              path: 'products',
              element: <ProductManager />,
            },
            {
              path: 'products/variants',
              element: <VariantManager />,
            },
            {
              path: 'users',
              element: <UserManager />,
            },
            {
              path: 'media',
              element: <MediaManager />,
            },
            {
              path: 'banners',
              element: <BannerManager />,
            },
            {
              path: 'product-details',
              element: <ProductDetailManager />,
            },
            {
              path: 'news',
              element: <NewsManager />,
            },
          ],
        },
        {
          path: rootPaths.authRoot,
          element: (
            <AuthLayout>
              <Outlet />
            </AuthLayout>
          ),
          children: [
            {
              path: paths.signin,
              element: <Signin />,
            },
            {
              path: paths.signup,
              element: <Signup />,
            },
          ],
        },
        {
          path: '*',
          element: <Error404 />,
        },
      ],
    },
  ],
);

export default router;
