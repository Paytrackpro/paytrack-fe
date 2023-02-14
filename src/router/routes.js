import ROLE from "../consts/role"

const routes = [
  {
    path: "/admin",
    component: () => import("src/layouts/AdminLayout.vue"),
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
        path: "profile/edit",
        name: "admin.profile",
        component: () => import("pages/users/profile.vue"),
        meta: {
          title: "profile",
        },
      },
      {
        path: "profile",
        name: "admin.profile.edit",
        component: () => import("pages/users/profileInfo.vue"),
        meta: {
          title: "profile",
        },
      },
      {
        path: "payment",
        name: "admin.payment.list",
        component: () => import("pages/payments/listPage.vue"),
        meta: {
          title: "Payment List",
        },
      },
      {
        path: "payment/create",
        name: "admin.payment.create",
        component: () => import("pages/payments/createPage.vue"),
        meta: {
          title: "Payment Create",
        },
      },
      {
        path: "payment/:id(\\d+)",
        name: "admin.payment.detail",
        component: () => import("pages/payments/detailPage.vue"),
        meta: {
          title: "Payment Detail",
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("src/layouts/UserLayout.vue"),
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
        path: "profile",
        name: "user.profile",
        component: () => import("pages/users/profileInfo.vue"),
        meta: {
          title: "Profile",
        },
      },
      {
        path: "profile/edit",
        name: "user.profile.edit",
        component: () => import("pages/users/profile.vue"),
        meta: {
          title: "Profile Edit",
        },
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
        name: "user.payment.create",
        component: () => import("pages/payments/createPage.vue"),
        meta: {
          title: "Payment Create",
        },
      },
      {
        path: "payment/:id(\\d+)",
        name: "user.payment.detail",
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
]

export default routes
