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
<<<<<<< HEAD

  {
    path: "/userinfo",
    name: "UserInfo",
    component: () => import("pages/UserInfoPage.vue"),
=======
  {
    path: "/register",
    name: "Register",
    component: () => import("pages/register.vue"),
>>>>>>> 3cc8165f8a151c4ed028b33740951cf121b0823a
  },
]

export default routes
