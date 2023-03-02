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
              <q-item to="/profile" clickable v-close-popup>
                <q-item-section>Profile</q-item-section>
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
            <q-item :key="index" clickable :to="menuItem.to" active-class="bg-grey-3" v-if="shouldDisplayRoute(menuItem)" v-ripple>
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
import role from "src/consts/role"
import { mapGetters } from "vuex"
export default {
  data() {
    return {
      left: false,
      drawer: false,
      menuList: [
        {
          icon: "home",
          label: "Dashboard",
          to: "/",
        },
        {
          icon: "people",
          label: "User Management",
          to: "/users",
          role: role.ADMIN,
        },
        {
          icon: "call_received",
          label: "Get Pay",
          separator: false,
          to: "/get-pay",
        },
        {
          icon: "arrow_outward",
          label: "Pay",
          separator: false,
          to: "/pay",
        },
        {
          icon: "settings",
          label: "Settings",
          separator: false,
          to: "/profile/settings",
        },
      ],
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
    isAdmin() {
      return this.user && this.user.role === role.ADMIN
    },
  },
  methods: {
    shouldDisplayRoute(menuItem) {
      return !menuItem.role || (menuItem.role === role.ADMIN && this.isAdmin)
    },
    setUserName() {
      let user = this.$store.getters["user/getUserProfile"]
      if (user) {
        user = JSON.parse(user)
        if (!this.empty(user.userName)) {
          this.isShowAvartar = false
          this.user = user
        }
      }
    },
    logOut() {
      this.$store.dispatch("auth/logOut")
    },
    empty(str) {
      return (
        typeof str == "undefined" ||
        !str ||
        str.length === 0 ||
        str === "" ||
        !/[^\s]/.test(str) ||
        /^\s*$/.test(str) ||
        str.replace(/\s/g, "") === ""
      )
    },
  },
}
</script>
