<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-toolbar-title> {{ $route.meta.title || "MGMT" }} </q-toolbar-title>
        <q-avatar>
          <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" />
        </q-avatar>
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
export default {
  data() {
    return {
      left: false,
      drawer: false,
      menuList: [
        {
          icon: "people",
          label: "User Management",
          to: this.$router.resolve({ name: "UserList" }).href,
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
}
</script>
