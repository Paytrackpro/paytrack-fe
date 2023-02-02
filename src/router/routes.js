const routes = [
  {
    path: "/",
    component: () => import("layouts/main.vue"),
    children: [
      {
        path: "/",
        name: "Home",
        component: () => import("pages/home.vue"),
        meta: {
          title: 'Home'
        },
      },
      {
        path: "/users",
        name: "UserList",
        component: () => import("pages/users/list.vue"),
        meta: {
          title: 'User Management'
        }
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
