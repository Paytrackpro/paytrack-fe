<template>
  <q-card>
    <q-tabs>
      <q-route-tab to="profile/settings" label="Settings" exact />
      <q-route-tab to="profile" label="Profile" />
    </q-tabs>
    <router-view />
  </q-card>
</template>

<script>
export default {
  name: "profile",
  components: {},
  data() {
    let user = localStorage.getItem("user")
    if (typeof user == "string" && user.length > 0) {
      user = JSON.parse(user)
    } else {
      user = {}
    }
    return {
      user,
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {},
    }
  },
}
</script>

<style scoped>
.profile-padding {
  padding: 20px 50px;
}
.profile-title {
  text-transform: uppercase;
  font-weight: bold;
}
</style>
