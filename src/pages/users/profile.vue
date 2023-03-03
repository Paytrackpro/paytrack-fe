<template>
  <q-card>
    <q-tabs>
      <q-route-tab to="/profile/settings" label="Settings" />
      <q-route-tab to="/profile" label="Profile" />
    </q-tabs>
    <router-view />
  </q-card>
</template>

<script>
export default {
  name: "userProfile",
  components: {},
  data() {
    return {
    };
  },
}
</script>


<style scoped>
</style>
