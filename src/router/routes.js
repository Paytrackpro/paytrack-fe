const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("pages/home.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("pages/login.vue"),
  },

  {
    path: "/user",
    component: () => import("pages/UserPage.vue"),
  },
]

export default routes
