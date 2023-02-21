import routes from "./routes"
import store from "../store"
import Vue from "vue"
import VueRouter from "vue-router"
import ROLE from "../consts/role"

Vue.use(VueRouter)

const router = new VueRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  mode: "history",
  routes,
})

router.beforeEach((to, from, next) => {
  const publicPages = ["Login", "Register", "OTP"]
  const authRequired = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthenticated = store.getters["auth/isAuthenticated"]
  const role = store.getters["auth/getUser"] ? store.getters["auth/getUser"].role : null

  if (isAuthenticated && publicPages.includes(to.name)) {
    if (role === ROLE.USER) {
      next({ name: "user.home" })
    } else if (role === ROLE.ADMIN) {
      next({ name: "Home" })
    } else {
      next({ name: "404" })
    }

    return
  }

  if (!isAuthenticated && authRequired) {
    next({ name: "Login" })
    return
  }

  if (authRequired) {
    if (to.matched.some((record) => record.meta.roles && record.meta.roles.includes(role))) {
      next()
    } else {
      next({ name: "404" })
    }
  } else {
    next()
  }
})

export default router
