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
  {
    path: '/user',
    name:'User',
    component: () => import('layouts/UserMainLayout.vue'),
    children: [
      {path: '/profile', component: () => import('pages/user/profile/userProfile.vue')},
    ]
  },
]

export default routes
