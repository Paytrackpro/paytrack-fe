<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-toolbar-title> {{ $route.meta.title || "MGMT" }} </q-toolbar-title>
        <div>
          <q-avatar size="26px" v-if="this.isShowAvartar === true">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
          </q-avatar>
          <label v-else class="profile-label"><span >{{ getUser }}</span></label>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable to="profileinfo">
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click='logout'>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
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
      user : '',
      isShowAvartar : true,
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
          label: "Setting",
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
  computed : {
    getUser(){
       return (this.empty(this.user.displayName))? this.user.userName : this.user.displayName;
    }
  },
  mounted :function(){
    this.setUserName();
  },
  methods : {
    setUserName(){
      let userProfile = this.$store.getters['user/getUserProfile'];
      userProfile = JSON.parse(userProfile)
      if(!this.empty(userProfile.userName)){
        this.isShowAvartar = false;
        this.user = userProfile;
      }
    },
    logout(){
      this.$store
        .dispatch('auth/logOut')
    },
    empty(str){
      return (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,"") === "");
    }
  }
}
</script>
<style lang="scss">
  .profile-label{
    font-weight: bold;
    text-transform: uppercase;
  }
  .profile-label:hover{
    cursor: pointer;
    text-decoration:underline;
  }
</style>
