<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white shadow-4">
      <q-toolbar class="GNL__toolbar">
        <q-btn
          flat
          dense
          round
          @click="$q.screen.gt.sm ? toogleMiniState() : toggleLeftDrawer()"
          aria-label="Menu"
          icon="menu"
          class="q-mr-sm"
        />
        <q-toolbar-title> Paytrack.pro </q-toolbar-title>
        <q-btn dense color="cyan-10" round icon="shopping_cart" class="q-mr-sm" @click="toCartPage()">
          <q-badge color="red" floating>{{ cartCount }}</q-badge>
          <q-tooltip>Go to your cart</q-tooltip>
        </q-btn>
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
    <q-drawer show-if-above v-model="leftDrawerOpen" :mini="miniState" side="left" class="left-sidebar" :width="280">
      <q-scroll-area class="fit">
        <q-list padding class="text-grey-2">
          <template v-for="(menuItem, index) in menuList">
            <q-item
              :key="index"
              clickable
              :to="menuItem.to"
              active-class="bg-cyan-2 sidebar-active-item"
              class="GNL__drawer-item sidebar-item"
              v-if="shouldDisplayRoute(menuItem) && !isMyShop(menuItem.label)"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon size="md" class="sidebar-icon" :name="'o_' + menuItem.icon" />
              </q-item-section>
              <q-item-section>
                <span class="sidebar-text"
                  >{{ menuItem.label }}
                  <q-badge
                    :label="approvalCount"
                    style="margin-left: 5px; padding-left: 8px; font-size: 12px; width: 22px; height: 20px"
                    v-if="menuItem.label === 'Pending Approvals'"
                  ></q-badge
                ></span>
              </q-item-section>
            </q-item>
            <q-expansion-item
              :key="index"
              class="my-shop-expansion"
              icon="o_shopping_bag"
              label="My Shop"
              v-if="isMyShop(menuItem.label)"
            >
              <q-list class="q-pl-lg">
                <q-item to="/shop/products/list" active-class="q-item-no-link-highlighting">
                  <q-item-section avatar>
                    <q-icon name="o_inventory_2" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>My Products</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item to="/shop/orders/list" active-class="q-item-no-link-highlighting">
                  <q-item-section avatar>
                    <q-icon name="o_list_alt" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Orders Management</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <router-view :approvalCount="approvalCount" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import role from 'src/consts/role'
import { mapGetters } from 'vuex'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
export default {
  data() {
    return {
      drawer: false,
      menuList: [
        {
          icon: 'home',
          label: 'Homepage',
          separator: false,
          to: '/home',
        },
        {
          icon: 'schedule',
          label: 'Pending Approvals',
          separator: false,
          to: '/approvals',
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
          icon: 'payment',
          label: 'My Shop',
          separator: false,
          to: '/my-shop',
        },
        {
          icon: 'supervisor_account',
          label: 'User Management',
          to: '/users',
          role: role.ADMIN,
        },
        {
          icon: 'settings',
          label: 'Settings',
          separator: false,
          to: '/settings',
        },
      ],
      approvalCount: 0,
      cartCount: 0,
    }
  },
  async created() {
    this.$api
      .get(`/payment/approval-count`)
      .then((data) => {
        this.approvalCount = data.count
        if (this.approvalCount === 0) {
          let approvalsIndex = this.getApprovalPendingIndex()
          this.menuList.splice(approvalsIndex, 1)
          if (this.$route.name.indexOf('approvals') > -1) {
            this.$router.push({ path: `get-paid` })
          }
        }
      })
      .catch(() => {
        return
      })
    this.getCartCount()
  },
  setup() {
    const $q = useQuasar()
    const leftDrawerOpen = ref(false)
    const miniState = ref(false)
    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      miniState,
      toogleMiniState() {
        miniState.value = !miniState.value
      },
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
    isMyShop(label) {
      return label == 'My Shop'
    },
    getApprovalPendingIndex() {
      let result = 1
      this.menuList.forEach((item, index) => {
        if (item.to.includes('/approvals')) {
          result = index
          return
        }
      })
      return result
    },
    getCartCount() {
      this.$api
        .get(`/cart/count`)
        .then((data) => {
          this.cartCount = data
        })
        .catch(() => {
          return
        })
    },
    toCartPage() {
      this.$router.push({ name: 'cart', params: {} })
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
