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
    path: "/userinfo",
    name: "UserInfo",
    component: () => import("pages/UserInfoPage.vue"),
  },
]

export default routes
