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
    path: "/register",
    name: "Register",
    component: () => import("pages/register.vue"),
  },
  {
    path: '/user',
    component: () => import('layouts/UserMainLayout.vue'),
    children: [
      {path: '/profile', component: () => import('pages/user/profile/userProfile.vue')},
    ]
  },
]

export default routes
