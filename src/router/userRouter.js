const userRouters = [
  {
    path: "",
    name: "user.home",
    component: () => import("src/pages/users/home.vue"),
    meta: {
      title: "Home",
    },
  },
  {
    path: "/profile/",
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
    path: "/pay",
    name: "user.payment.pay",
    component: () => import("pages/payments/layout.vue"),
    meta: {
      title: "Pay",
    },
    children: [
      {
        path: "",
        name: "payment.pay",
        component: () => import("pages/payments/payPage.vue"),
        meta: {
          title: "Payment/ Pay",
        },
      }, {
        path: "create",
        name: "pay.payment.create",
        component: () => import("pages/payments/createPage.vue"),
        meta: {
          title: "Payment Create",
        },
      }, {
        path: ":id(\\d+)",
        name: "pay.payment.detail",
        component: () => import("pages/payments/detailPage.vue"),
        meta: {
          title: "Payment",
        },
      }
    ]
  }, {
    path: "/get-pay",
    name: "user.payment.list",
    component: () => import("pages/payments/layout.vue"),
    meta: {
      title: "Get Pay",
    },
    children: [
      {
        path: "",
        name: "payment.get-pay",
        component: () => import("pages/payments/getPayPage.vue"),
        meta: {
          title: "Payment/ Get Pay",
        },
      }, {
        path: "create",
        name: "get-pay.payment.create",
        component: () => import("pages/payments/createPage.vue"),
        meta: {
          title: "Payment Create",
        },
      }, {
        path: ":id(\\d+)",
        name: "get-pay.payment.detail",
        component: () => import("pages/payments/detailPage.vue"),
        meta: {
          title: "Payment detail",
        },
      }
    ]
  }
]

export { userRouters }
