<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  preFetch({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    const { authenticated, user } = store.state?.user || {}
    if (currentRoute.meta.public) {
      return redirect({ path: urlPath })
    }
    if (!authenticated && currentRoute.meta.requiresAuth) {
      return redirect({ path: '/login' })
    }
    if (authenticated && !currentRoute.meta.requiresAuth && !currentRoute.meta.public) {
      return redirect({ path: '/' })
    }
    const role = user?.role
    if (currentRoute.meta.roles && !currentRoute.meta.roles.includes(role)) {
      return redirect({ path: '/' })
    }
    redirect({ path: urlPath })
  },
}
</script>

<style>
.bg-image {
  background-image: linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%);
}
</style>
