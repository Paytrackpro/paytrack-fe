
import routes from "./routes"
import store from "../store"
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const router = new VueRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const publicPages       = ['Login'];
  const authRequired      = !publicPages.includes(to.name);
  const isAuthenticated   = store.getters['auth/isAuthenticated'];

  if (isAuthenticated && to.name === 'Login') {
    next({ name: 'Home'});
  }

  if (authRequired && !isAuthenticated) {
    next({ name: 'Login' });
  }

  next();
});

export default router;
