import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes"
import store from "../store"

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: [
      ...routes,
      {
        path: "/:catchAll(.*)*",
        component: () => import("pages/404.vue"),
      },
    ],

    history: createHistory(
      process.env.MODE === "ssr" ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });

  Router.beforeEach((to, from, next) => {
    const publicPages = ["login", "register", "otp"]
    const authRequired = to.matched.some((record) => record.meta.requiresAuth)
    const isAuthenticated = store.getters["auth/isAuthenticated"]
    const role = store.getters["auth/getUser"] ? store.getters["auth/getUser"].role : null

    if (isAuthenticated && publicPages.includes(to.name)) {
      next({ name: "home" })
      return
    }

    if (!isAuthenticated && authRequired) {
      next({ name: "login" })
      return
    }

    if (authRequired) {
      const roles = to.meta.roles;
      if (!roles || (roles && roles.includes(role))) {
        next()
      } else {
        next({ name: "404" })
      }
    } else {
      next()
    }
  })

  return Router;
});


// export default router
