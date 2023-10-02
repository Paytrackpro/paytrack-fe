import ROLE from '../consts/role'
import { PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'

const routes = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/home',
      },
      {
        path: 'home/',
        name: 'Homepage',
        component: () => import('pages/common/homepage.vue'),
        meta: {
          title: 'Homepage Products',
        },
      },
      {
        path: 'product-detail/:id(\\d+)',
        name: 'product.detail',
        component: () => import('pages/common/product_detail.vue'),
        meta: {
          title: 'Homepage Detail',
        },
      },
      {
        path: 'approvals/',
        name: 'approvals',
        component: () => import('pages/payments/approvals.vue'),
        meta: {
          title: 'Approval List',
        },
      },
      {
        path: 'settings/',
        name: 'settings',
        component: () => import('pages/users/settings.vue'),
        meta: {
          title: 'Settings',
        },
        children: [
          {
            path: ':settingTab',
            name: 'settings.tab',
            component: () => import('pages/users/settings.vue'),
            meta: {
              title: 'Settings',
            },
          },
        ],
      },
      {
        path: 'users',
        name: 'user.list',
        component: () => import('pages/admin/users/list.vue'),
        meta: {
          roles: [ROLE.ADMIN],
          title: 'User Management',
        },
      },
      {
        path: 'users/:id',
        name: 'user.detail',
        component: () => import('pages/admin/users/detail.vue'),
        meta: {
          roles: [ROLE.ADMIN],
          title: 'User Detail',
        },
      },
      {
        path: 'pay/',
        name: 'pay',
        component: () => import('pages/payments/layout.vue'),
        meta: {
          title: 'Pay',
        },
        children: [
          {
            path: '',
            name: 'pay.list',
            component: () => import('pages/payments/payPage.vue'),
            meta: {
              title: 'Make payment',
            },
          },
          {
            path: ':id(\\d+)',
            name: 'pay.detail',
            component: () => import('pages/payments/detailPage.vue'),
            meta: {
              title: 'Payment',
            },
          },
        ],
      },
      {
        path: 'get-paid/',
        name: 'get-paid',
        component: () => import('pages/payments/layout.vue'),
        meta: {
          title: 'Get Pay',
        },
        children: [
          {
            path: '',
            name: 'get-paid.list',
            component: () => import('pages/payments/getPaidPage.vue'),
            meta: {
              title: 'Get Paid',
            },
          },
          {
            path: 'create',
            name: 'get-paid.create',
            component: () => import('pages/payments/createPage.vue'),
            meta: {
              title: 'Get Paid/ Create',
            },
            props: {
              paymentType: PAYMENT_OBJECT_REQUEST,
            },
          },
          {
            path: ':id(\\d+)',
            name: 'get-paid.detail',
            component: () => import('pages/payments/detailPage.vue'),
            meta: {
              title: 'Get Paid/ detail',
            },
          },
        ],
      },
      {
        path: 'shop/',
        name: 'shop',
        component: () => import('pages/payments/layout.vue'),
        meta: {
          title: 'My Shop',
        },
        children: [
          {
            path: 'products',
            name: 'products',
            meta: {
              title: 'My Products',
            },
            children: [
              {
                path: 'list',
                name: 'products.list',
                component: () => import('pages/shop/products/list.vue'),
                meta: {
                  title: 'Product List',
                },
              },
              {
                path: 'create',
                name: 'products.create',
                component: () => import('pages/shop/products/create.vue'),
                meta: {
                  title: 'Create Product',
                },
              },
              {
                path: 'update/:id(\\d+)',
                name: 'products.update',
                component: () => import('pages/shop/products/update.vue'),
                meta: {
                  title: 'Update Product',
                },
              },
            ],
          },
          {
            path: 'orders',
            name: 'shop.orders.list',
            component: () => import('pages/shop/orders/list.vue'),
            meta: {
              title: 'My Orders',
            },
            props: {
              paymentType: PAYMENT_OBJECT_REQUEST,
            },
          },
        ],
      },
    ],
  },
  {
    path: '/',
    component: () => import('src/layouts/PublicLayout.vue'),
    children: [
      {
        path: '/payment/:id(\\d+)/:token',
        name: 'payment.detail',
        component: () => import('pages/payments/detailPage.vue'),
        meta: {
          title: 'Payment Detail',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('pages/register.vue'),
  },
]

export default routes
