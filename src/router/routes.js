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
        name: "UserList",
        component: () => import("pages/admin/users/list.vue"),
        meta: {
          title: "User Management",
        },
      },
      {
        path: "users/:id",
        name: "UserDetail",
        component: () => import("pages/admin/users/detail.vue"),
        meta: {
          title: "User Detail",
        },
      },
      {
        path: "profile",
        name: "AdminProfile",
        component: () => import("pages/users/profile.vue"),
        meta: {
          title: "profile",
        },
      },
      {
        path: "profileinfo",
        name: "AdminProfileInfo",
        component: () => import("pages/users/profileInfo.vue"),
        meta: {
          title: "profile",
        },
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
        path: "payment/create",
        name: "payment.create",
        component: () => import("pages/payments/createPage.vue"),
        meta: {
          title: "Payment Create",
        },
      },
      {
        path: "payment/:id(\\d+)",
        name: "payment.detail",
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
    name: "User Home",
    meta: {
      requiresAuth: true,
      roles: [ROLE.USER],
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
        path: "profileinfo",
        name: "UserProfileInfo",
        component: () => import("pages/users/profileInfo.vue"),
        meta: {
          title: "profile",
        },
      },
      {
        path: "profile",
        name: "UserProfile",
        component: () => import("pages/users/profile.vue"),
        meta: {
          title: "profile",
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
