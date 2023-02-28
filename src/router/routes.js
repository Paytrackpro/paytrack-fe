import ROLE from "../consts/role"

const routes = [
  {
    path: "/admin",
    component: () => import("src/layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: [ROLE.ADMIN],
    },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("src/pages/users/home.vue"),
        meta: {
          title: "Home",
        },
      },
      {
        path: "users",
        name: "admin.user.list",
        component: () => import("pages/admin/users/list.vue"),
        meta: {
          title: "User Management",
        },
      },
      {
        path: "users/:id",
        name: "admin.user.detail",
        component: () => import("pages/admin/users/detail.vue"),
        meta: {
          title: "User Detail",
        },
      },
      {
        path: "profile/",
        name: "admin.profile",
        component: () => import("src/pages/users/profile.vue"),
        meta: {
          title: "Profile",
        },
        children: [
          {
            path: "",
            name: "admin.profile.info",
            component: () => import("src/pages/users/info.vue"),
            meta: {
              title: "Profile Info",
            },
          },
          {
            path: "edit",
            name: "admin.profile.edit",
            component: () => import("src/pages/users/edit.vue"),
            meta: {
              title: "Profile Edit",
            },
          },
          {
            path: "settings",
            name: "admin.settings",
            component: () => import("pages/users/settings.vue"),
            meta: {
              title: "Settings",
            },
          },
          {
            path: "settings/2fa",
            name: "admin.settings.2fa",
            component: () => import("pages/users/2fa.vue"),
            meta: {
              title: "2FA",
            },
          },
        ],
      },
      {
        path: "payment",
        name: "admin.payment.list",
        component: () => import("pages/payments/listPage.vue"),
        meta: {
          title: "Payment List",
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("src/layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
      roles: [ROLE.USER],
    },
    children: [
      {
        path: "",
        name: "user.home",
        component: () => import("src/pages/users/home.vue"),
        meta: {
          title: "Home",
        },
      },
      {
        path: "profile/",
        name: "user.profile",
        component: () => import("src/pages/users/profile.vue"),
        meta: {
          title: "Profile",
        },
        children: [
          {
            path: "",
            name: "user.profile.info",
            component: () => import("src/pages/users/info.vue"),
            meta: {
              title: "Profile Info",
            },
          },
          {
            path: "edit",
            name: "user.profile.edit",
            component: () => import("src/pages/users/edit.vue"),
            meta: {
              title: "Profile Edit",
            },
          },
          {
            path: "settings",
            name: "user.settings",
            component: () => import("pages/users/settings.vue"),
            meta: {
              title: "Settings",
            },
          },
          {
            path: "settings/2fa",
            name: "user.settings.2fa",
            component: () => import("pages/users/2fa.vue"),
            meta: {
              title: "2FA",
            },
          },
        ],
      },
      {
        path: "payment",
        name: "user.payment.list",
        component: () => import("pages/payments/listPage.vue"),
        meta: {
          title: "Payment List",
        },
      },
      {
        path: "payment/create",
        name: "payment.create",
        component: () => import("pages/payments/createPage.vue"),
        meta: {
          title: "Payment Create",
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("src/layouts/MainLayout.vue"),
    children: [
      {
        path: "/payment/:id(\\d+)",
        name: "payment.detail",
        component: () => import("pages/payments/detailPage.vue"),
        meta: {
          title: "Payment Detail",
        },
      },
    ],
  },
  {
    path: "/404",
    name: "404",
    component: () => import("pages/404.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("pages/login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("pages/register.vue"),
  },
  {
    path: "/otp",
    name: "OTP",
    component: () => import("pages/otp.vue"),
  },
]

export default routes
