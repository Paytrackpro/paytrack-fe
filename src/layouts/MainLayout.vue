<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white shadow-4">
      <q-toolbar>
        <q-avatar rounded>
          <img src="../assets/system-logo.png" />
        </q-avatar>
        <q-toolbar-title> MGMT-NG </q-toolbar-title>
        <q-btn flat no-caps>
          <q-item class="q-pa-none">
            <q-item-section avatar>
              <q-avatar>
                <img src="../assets/user-icon.png" />
              </q-avatar>
            </q-item-section>

            <q-item-section class="text-left" no-caps>
              <q-item-label lines="1" class="text-size-14 header-text">{{
                user.displayName ? user.displayName : user.userName
              }}</q-item-label>
              <q-item-label v-if="user.displayName" lines="2">
                <span class="text-size-12 header-text">{{ user.userName }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-menu transition-show="jump-down" transition-hide="jump-up">
            <q-list style="min-width: 100px">
              <q-item @click="logOut" clickable v-close-popup>
                <q-item-section>Log out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-drawer show-if-above side="left" class="left-sidebar" :width="280">
      <q-scroll-area class="fit">
        <q-list padding class="text-grey-2">
          <template v-for="(menuItem, index) in menuList">
            <q-item
              :key="index"
              clickable
              :to="menuItem.to"
              active-class="bg-cyan-2 sidebar-active-item"
              :class="'sidebar-item' + (menuItem.label == 'Settings' ? ' settings-sidebar' : '')"
              v-if="shouldDisplayRoute(menuItem)"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon size="md" class="sidebar-icon" :name="'o_' + menuItem.icon" />
              </q-item-section>
              <q-item-section>
                <span class="sidebar-text">{{ menuItem.label }}</span>
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import role from 'src/consts/role'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      drawer: false,
      menuList: [
        {
          icon: 'dashboard',
          label: 'Dashboard',
          to: '/dashboard',
        },
        {
          icon: 'supervisor_account',
          label: 'User Management',
          to: '/users',
          role: role.ADMIN,
        },
        {
          icon: 'sticky_note_2',
          label: 'Get Paid',
          separator: false,
          to: '/get-paid',
        },
        {
          icon: 'payment',
          label: 'Pay',
          separator: false,
          to: '/pay',
        },
        {
          icon: 'settings',
          label: 'Settings',
          separator: false,
          to: '/settings',
        },
      ],
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    isAdmin() {
      return this.user && this.user.role === role.ADMIN
    },
  },
  methods: {
    shouldDisplayRoute(menuItem) {
      return !menuItem.role || (menuItem.role === role.ADMIN && this.isAdmin)
    },
    logOut() {
      this.$store.dispatch('user/logOut')
      this.$router.push({ path: '/login' })
    },
    empty(str) {
      return (
        typeof str == 'undefined' ||
        !str ||
        str.length === 0 ||
        str === '' ||
        !/[^\s]/.test(str) ||
        /^\s*$/.test(str) ||
        str.replace(/\s/g, '') === ''
      )
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        if (to.meta.requiresAuth && this.user.id === 0) {
          this.$router.push({
            path: '/login',
          })
        }
      },
    },
  },
}
</script>
