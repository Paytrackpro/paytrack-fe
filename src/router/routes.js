const routes = [
  {
    path: "/",
    children: [{ path: "", component: () => import("src/pages/home.vue") }],
  },
  {
    path: "/login",
    component: () => import("pages/login.vue"),
  },

  {
    path: "/user",
    component: () => import("pages/UserPage.vue"),
  },
]

export default routes
