import ROLE from "../consts/role";

const routes = [
  {
    path: "/",
    component: () => import("src/layouts/MainLayout.vue"),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "home/",
        name: "home",
        component: () => import("src/pages/users/home.vue"),
        meta: {
          title: "Home",
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
        path: "pay/",
        name: "pay",
        component: () => import("pages/payments/layout.vue"),
        meta: {
          title: "Pay",
        },
        children: [
          {
            path: "",
            name: "pay.list",
            component: () => import("pages/payments/payPage.vue"),
            meta: {
              title: "Payment/Pay",
            },
          },
          {
            path: "create",
            name: "pay.create",
            component: () => import("pages/payments/createPage.vue"),
            meta: {
              title: "Payment Create",
            },
          },
          {
            path: ":id(\\d+)",
            name: "pay.detail",
            component: () => import("pages/payments/detailPage.vue"),
            meta: {
              title: "Payment",
            },
          },
        ],
      },
      {
        path: "get-paid/",
        name: "get-paid",
        component: () => import("pages/payments/layout.vue"),
        meta: {
          title: "Get Pay",
        },
        children: [
          {
            path: "",
            name: "get-paid.list",
            component: () => import("pages/payments/getPaidPage.vue"),
            meta: {
              title: "Get Paid",
            },
          },
          {
            path: "create",
            name: "get-paid.create",
            component: () => import("pages/payments/createPage.vue"),
            meta: {
              title: "Get Paid/ Create",
            },
          },
          {
            path: ":id(\\d+)",
            name: "get-paid.detail",
            component: () => import("pages/payments/detailPage.vue"),
            meta: {
              title: "Get Paid/ detail",
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
];

export default routes;
