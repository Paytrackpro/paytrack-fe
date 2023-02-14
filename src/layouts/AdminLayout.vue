<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-toolbar-title> {{ $route.meta.title || "MGMT" }} </q-toolbar-title>
        <q-btn flat>
          {{ user.userName }}
          <q-menu transition-show="jump-down" transition-hide="jump-up">
            <q-list style="min-width: 100px">
              <q-item to="/admin/profile/edit" clickable v-close-popup>
                <q-item-section>Edit profile</q-item-section>
              </q-item>
              <q-separator />
              <q-item @click="logOut" clickable v-close-popup>
                <q-item-section>Log out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="left" side="left" bordered>
      <q-scroll-area class="fit">
        <q-list>
          <template v-for="(menuItem, index) in menuList">
            <q-item :key="index" clickable :to="menuItem.to" active-class="bg-grey-3" v-ripple>
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      left: false,
      drawer: false,
      menuList: [
        {
          icon: "people",
          label: "User Management",
          to: "/admin/users",
        },
        {
          icon: "book",
          label: "Worklog",
          separator: false,
        },
        {
          icon: "credit_card",
          label: "Payment",
          separator: false,
          to: "/admin/payment",
        },
        {
          icon: "error",
          label: "---",
          separator: false,
        },
        {
          icon: "settings",
          label: "---",
          separator: false,
        },
        {
          icon: "feedback",
          label: "---",
          separator: false,
        },
      ],
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
  },
  methods: {
    logOut() {
      this.$store.dispatch("auth/logOut")
    },
  },
}
</script>
