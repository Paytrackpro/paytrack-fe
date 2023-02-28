<template>
  <admin-layout v-if="isAdmin">
    <router-view />
  </admin-layout>
  <user-layout v-else-if="isUser">
    <router-view />
  </user-layout>
  <router-view v-else />
</template>

<script>
import ROLE from "src/consts/role";
import { mapGetters } from "vuex";
import AdminLayout from "./AdminLayout.vue";
import UserLayout from "./UserLayout.vue";

export default {
  components: { AdminLayout, UserLayout },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
    isAdmin() {
      return this.user && this.user.role === ROLE.ADMIN;
    },
    isUser() {
      return this.user && this.user.role === ROLE.USER;
    },
  },
};
</script>
