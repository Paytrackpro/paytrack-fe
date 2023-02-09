const routes = [
  {
    path: "/",
    component: () => import("layouts/main.vue"),
    children: [
      {
        path: "/",
        name: "Home",
        component: () => import("src/pages/admin/home.vue"),
        meta: {
          title: "Home",
        },
      },
      {
        path: "/users",
        name: "UserList",
        component: () => import("pages/admin/users/list.vue"),
        meta: {
          title: "User Management",
        },
      },
      {
        path: "/users/:id",
        name: "UserDetail",
        component: () => import("pages/admin/users/detail.vue"),
        meta: {
          title: "User Detail",
        },
      },
      {
        path: "/profile",
        name: "Profile",
        component: () => import("pages/users/profile.vue"),
        meta: {
          title: "profile",
        },
      },
      {
        path: "/profileinfo",
        name: "ProfileInfo",
        component: () => import("pages/users/profileInfo.vue"),
        meta: {
          title: "profile",
        },
      },
      {
        path: "/payment",
        name: "Payment",
        component: () => import("pages/payments/layout.vue"),
        children: [
          {
            path: "/",
            name: "payment.list",
            component: () => import("pages/payments/listPage.vue"),
          },
          {
            path: "create",
            name: "payment.create",
            component: () => import("pages/payments/createPage.vue"),
          },
          {
            path: ":id(\\d+)",
            name: "payment.detail",
            component: () => import("pages/payments/detailPage.vue"),
          },
        ],
      },
    ],
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
