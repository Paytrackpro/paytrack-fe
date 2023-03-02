<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import ROLE from "src/consts/role";

export default {
  name: "App",
  preFetch({
    store,
    currentRoute,
    previousRoute,
    redirect,
    ssrContext,
    urlPath,
    publicPath,
  }) {
    const { authenticated, user } = store.state?.auth || {};
    if (!authenticated) {
      return redirect({ path: "/login" });
    }

    if (authenticated && !currentRoute.meta.requiresAuth) {
      return redirect({ path: "/"})
    }

    const role = user?.role;
    if (currentRoute.meta.roles && !currentRoute.meta.roles.includes(role)) {
      return redirect({ path: "/" });
    }

    redirect({ path: urlPath });
  },
};
</script>

<style>
.bg-image {
  background-image: linear-gradient(135deg, #7028e4 0%, #e5b2ca 100%);
}
</style>
