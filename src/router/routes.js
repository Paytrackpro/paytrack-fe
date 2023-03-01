import ROLE from "../consts/role"

const routes = [
  {
    path: "/",
    component: () => import("src/layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "home",
        component: () => import("src/pages/users/home.vue"),
        meta: {
          title: "Home",
        },
      },
      {
        path: "users",
        name: "user.list",
        component: () => import("pages/admin/users/list.vue"),
        meta: {
          roles: [ROLE.ADMIN],
          title: "User Management",
        },
      },
      {
        path: "users/:id",
        name: "user.detail",
        component: () => import("pages/admin/users/detail.vue"),
        meta: {
          roles: [ROLE.ADMIN],
          title: "User Detail",
        },
      },
      {
        path: "profile/",
        name: "profile",
        component: () => import("src/pages/users/profile.vue"),
        meta: {
          title: "Profile",
        },
        children: [
          {
            path: "",
            name: "profile.info",
            component: () => import("src/pages/users/info.vue"),
            meta: {
              title: "Profile Info",
            },
          },
          {
            path: "edit",
            name: "profile.edit",
            component: () => import("src/pages/users/edit.vue"),
            meta: {
              title: "Profile Edit",
            },
          },
          {
            path: "settings",
            name: "settings",
            component: () => import("pages/users/settings.vue"),
            meta: {
              title: "Settings",
            },
          },
          {
            path: "settings/2fa",
            name: "settings.2fa",
            component: () => import("pages/users/2fa.vue"),
            meta: {
              title: "2FA",
            },
          },
        ],
      },
      {
        path: "payment",
        name: "payment.list",
        component: () => import("pages/payments/listPage.vue"),
        meta: {
          title: "Payment List",
        },
      },
      {
        path: "pay",
        name: "user.payment.list",
        component: () => import("pages/payments/layout.vue"),
        meta: {
          title: "Pay",
        },
        children: [
          {
            path: "/",
            name: "payment.pay",
            component: () => import("pages/payments/payPage.vue"),
            meta: {
              title: "Payment/Pay",
            },
          },
          {
            path: "create",
            name: "payment.create",
            component: () => import("pages/payments/createPage.vue"),
            meta: {
              title: "Payment Create",
            },
          },
          {
            path: ":id(\\d+)",
            name: "payment.detail",
            component: () => import("pages/payments/detailPage.vue"),
            meta: {
              title: "Payment",
            },
          },
        ],
      },
      {
        path: "get-pay",
        name: "user.payment.list",
        component: () => import("pages/payments/layout.vue"),
        meta: {
          title: "Get Pay",
        },
        children: [
          {
            path: "/",
            name: "payment.get-pay",
            component: () => import("pages/payments/getPayPage.vue"),
            meta: {
              title: "Payment/Get Pay",
            },
          },
          {
            path: "create",
            name: "payment.create",
            component: () => import("pages/payments/createPage.vue"),
            meta: {
              title: "Payment Create",
            },
          },
          {
            path: ":id(\\d+)",
            name: "payment.detail",
            component: () => import("pages/payments/detailPage.vue"),
            meta: {
              title: "Payment detail",
            },
          },
        ],
      },
    ],
  },
  {
    path: "/",
    component: () => import("src/layouts/PublicLayout.vue"),
    children: [
      {
        path: "/payment/:id(\\d+)/:token",
        name: "payment.detail",
        component: () => import("pages/payments/detailPage.vue"),
        meta: {
          title: "Payment Detail",
        },
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("pages/login.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("pages/register.vue"),
  },
  {
    path: "/otp",
    name: "otp",
    component: () => import("pages/otp.vue"),
  },
  {
    path: "*",
    component: () => import("pages/404.vue"),
  },
]

export default routes;
