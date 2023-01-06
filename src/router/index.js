
import routes from "./routes"
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const router = new VueRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  mode: 'history',
  routes // short for `routes: routes`
})

export default router;
