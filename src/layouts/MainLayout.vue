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
        <q-btn
          size="md"
          label="Start Work"
          icon="timer"
          type="button"
          color="primary"
          class="q-mr-sm btn btn-animated"
          v-if="!working"
          @click="startWorking(false)"
        />
        <q-card-section v-if="working">
          <q-btn
            v-if="pausing"
            size="sm"
            class="timer-btc-icon"
            flat
            color="white"
            icon="play_arrow"
            @click="resumeTime"
          />
          <q-btn
            v-if="!pausing"
            size="sm"
            class="timer-btc-icon q-mr-xs"
            flat
            color="white"
            icon="pause"
            @click="pauseTime"
          />
          <q-btn size="sm" class="timer-btc-icon q-mr-xs" flat color="white" icon="stop" @click="stopTime" />
          <span>{{ timeHour }}</span>
          <span>{{ timeMin }}</span>
          :
          <span>{{ timeSecond }}</span>
        </q-card-section>
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
            <div
              class="row center-row q-my-sm separator-full-display"
              :key="'separator_' + index"
              v-if="menuItem.label === 'User Management' && isAdmin"
            >
              <q-separator class="width-40" />
              <span class="width-20 text-weight-medium q-pl-sm">Admin</span>
              <q-separator class="width-40" />
            </div>
            <q-separator
              class="separator-mini-display"
              :key="'sepa_no_text_' + index"
              v-if="menuItem.label === 'User Management' && isAdmin"
            />
            <q-item
              :key="index"
              clickable
              :to="menuItem.to"
              active-class="bg-cyan-2 sidebar-active-item"
              class="GNL__drawer-item sidebar-item"
              v-if="shouldDisplayRoute(menuItem)"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon size="md" class="sidebar-icon" :name="'o_' + menuItem.icon" />
              </q-item-section>
              <q-item-section>
                <span class="row sidebar-text justify-between"
                  >{{ menuItem.label }}
                  <q-badge
                    :label="approvalCount"
                    style="font-size: 12px; height: 20px"
                    v-if="menuItem.label === 'Pending Approvals'"
                  >
                    <q-tooltip>Number of invoices that need to be approved</q-tooltip>
                  </q-badge>
                  <q-badge
                    :label="unpaidCount"
                    style="font-size: 12px; height: 20px"
                    v-if="menuItem.label === 'Pay' && unpaidCount > 0"
                  >
                    <q-tooltip>Number of unpaid invoices</q-tooltip>
                  </q-badge></span
                >
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <router-view :approvalCount="approvalCount" :unpaidCount="unpaidCount" @updateUnpaidCount="updateUnpaidCount" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar'
import role from 'src/consts/role'
import { connectSocket, disconnectSocket, isSocketConnected } from 'src/helper/socket.js'
import { ref } from 'vue'
import { mapGetters } from 'vuex'
import { api, axios } from 'boot/axios'
export default {
  data() {
    return {
      drawer: false,
      menuList: [
        {
          icon: 'schedule',
          label: 'Pending Approvals',
          separator: false,
          to: '/approvals',
        },
        {
          icon: 'payment',
          label: 'Pay',
          separator: false,
          to: '/pay',
        },
        {
          icon: 'sticky_note_2',
          label: 'Get Paid',
          separator: false,
          to: '/get-paid',
        },
        {
          icon: 'schedule',
          label: 'Time Log',
          separator: false,
          to: '/timelog',
        },
        {
          icon: 'summarize',
          label: 'Report',
          separator: false,
          to: '/report',
        },
        {
          icon: 'settings',
          label: 'Settings',
          separator: false,
          to: '/settings',
        },
        {
          icon: 'supervisor_account',
          label: 'User Management',
          separator: false,
          role: role.ADMIN,
          to: '/users',
        },
        {
          icon: 'contact_page',
          label: 'System Report',
          separator: false,
          role: role.ADMIN,
          to: '/system-report',
        },
      ],
      working: false,
      pausing: true,
      approvalCount: 0,
      unpaidCount: 0,
      displayAdminSeparator: true,
      displayReport: true,
      totalTimeSeconds: 0,
      interval: null,
      timeHour: '',
      timeMin: '00',
      timeSecond: '00',
      runningTimer: {},
    }
  },
  async created() {
    this.$api
      .get(`/payment/initialization-count`)
      .then((data) => {
        this.approvalCount = data.approvalCount
        this.unpaidCount = data.unpaidCount
        if (this.approvalCount === 0) {
          this.menuList.splice(0, 1)
          if (this.$route.name.indexOf('approvals') > -1) {
            this.$router.push({ path: `pay` })
          }
        }
      })
      .catch(() => {
        return
      })
    this.$api
      .get(`/payment/has-report`)
      .then((data) => {
        this.displayReport = data
      })
      .catch(() => {
        return
      })
    if (!isSocketConnected()) {
      connectSocket(`${this.$store.getters['user/getUser'].id}`)
    }
    //Get running timer (if have)
    this.$api
      .get(`/user/get-running-timer`)
      .then((data) => {
        if (!data.exist) {
          this.working = false
          return
        }
        this.runningTimer = data.runningTimer
        if (!this.runningTimer) {
          this.working = false
          return
        }
        this.working = true
        this.pausing = this.runningTimer.pausing
        //calculate sum of total of seconds
        this.totalTimeSeconds = data.totalSeconds
        if (this.working && this.pausing) {
          this.displayInitTimer()
        }
        this.handlerStartTimer()
      })
      .catch(() => {
        return
      })
  },
  beforeUnmount() {
    disconnectSocket()
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
        this.displayAdminSeparator = !this.displayAdminSeparator
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
      if (menuItem.to == '/report') {
        return this.displayReport
      }
      return !menuItem.role || (menuItem.role === role.ADMIN && this.isAdmin)
    },
    logOut() {
      disconnectSocket()
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
    updateUnpaidCount(count) {
      this.unpaidCount = count
    },
    async startWorking(fromPause) {
      var self = this
      //Create user timer
      if (!fromPause) {
        this.$api
          .post(`/user/start_timer`)
          .then((data) => {
            this.working = true
            this.pausing = false
            self.handlerStartTimer()
          })
          .catch(() => {
            this.$q.notify({
              type: 'negative',
              message: `Another timer is running or has an error. Please try again!`,
            })
            return
          })
      }
    },
    handlerStartTimer() {
      if (!this.interval && !this.pausing) {
        var self = this
        this.interval = setInterval(function () {
          self.totalTimeSeconds += 1
          var hour = Math.floor(self.totalTimeSeconds / 3600)
          self.timeHour = ''
          if (hour > 0) {
            self.timeHour = self.pad(hour) + ' : '
          }
          self.timeMin = self.pad(Math.floor((self.totalTimeSeconds / 60) % 60))
          self.timeSecond = self.pad(parseInt(self.totalTimeSeconds % 60))
        }, 1000)
      }
    },
    displayInitTimer() {
      var hour = Math.floor(this.totalTimeSeconds / 3600)
      self.timeHour = ''
      if (hour > 0) {
        this.timeHour = this.pad(hour) + ' : '
      }
      this.timeMin = this.pad(Math.floor((this.totalTimeSeconds / 60) % 60))
      this.timeSecond = this.pad(parseInt(this.totalTimeSeconds % 60))
    },
    pad(val) {
      return val > 9 ? val : '0' + val
    },
    pauseTime() {
      //handler pausing on backend
      this.$api
        .post(`/user/pause_timer`)
        .then((data) => {
          if (data.error) {
            this.$q.notify({
              type: 'negative',
              message: data.msg,
            })
            return
          }
          clearInterval(this.interval)
          this.interval = null
          this.pausing = true
        })
        .catch(() => {
          this.$q.notify({
            type: 'negative',
            message: `Execution of pause timer failed`,
          })
          return
        })
    },
    resumeTime() {
      this.$api
        .post(`/user/resume_timer`)
        .then((data) => {
          if (data.error) {
            this.$q.notify({
              type: 'negative',
              message: data.msg,
            })
            return
          }
          this.pausing = false
          this.handlerStartTimer()
        })
        .catch(() => {
          this.$q.notify({
            type: 'negative',
            message: `Resume timer failed`,
          })
          return
        })
    },
    stopTime() {
      this.$api
        .post(`/user/stop_timer`)
        .then((data) => {
          if (data.error) {
            this.$q.notify({
              type: 'negative',
              message: data.msg,
            })
            return
          }
          this.totalTimeSeconds = 0
          clearInterval(this.interval)
          this.timeMin = '00'
          this.timeSecond = '00'
          this.timeHour = ''
          this.interval = null
          this.working = false
          this.pausing = false
        })
        .catch(() => {
          this.$q.notify({
            type: 'negative',
            message: `Stop timer failed`,
          })
          return
        })
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
