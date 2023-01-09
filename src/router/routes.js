const routes = [
  {
    path: "/",
    component: () => import("src/pages/home.vue"),
  },
  {
    path: "/login",
    component: () => import("pages/login.vue"),
  },
]

export default routes
