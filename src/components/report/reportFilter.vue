<template>
  <div class="row q-mb-md q-col-gutter-md">
    <div :class="getDateRangeColumnClass()">
      <p class="q-mt-none q-mb-xs text-weight-medium" v-if="!isreport">Date Range</p>
      <p class="q-mt-none q-mb-xs q-mr-sm text-weight-medium" v-if="isreport">Filter</p>
      <q-field outlined stack-label class="date-range-field">
        <span>{{ `${paymentDateRange.from} - ${paymentDateRange.to}` }}</span>
        <q-popup-proxy transition-show="scale" transition-hide="scale">
          <q-list style="min-width: 100px" class="cursor-pointer">
            <q-item clickable v-close-popup @click="setRange(0)">
              <q-item-section>Last 24h </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setRange(1)">
              <q-item-section>This month </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setRange(2)">
              <q-item-section>Last month </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setRange(3)">
              <q-item-section>Current Year </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setRange(4)">
              <q-item-section>Last Year </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setRange(5)">
              <q-item-section>All</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="customRangeChoose()">
              <q-item-section>Custom Range</q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-field>
    </div>
    <div class="col-12 col-sm-4 col-md-3 q-py-sm q-my-sm field-shadow" v-if="!isreport">
      <p class="q-mt-none q-mb-xs text-weight-medium">Members</p>
      <q-select
        v-model="memberModel"
        use-input
        use-chips
        multiple
        outlined
        input-debounce="0"
        @new-value="createMemberValue"
        :options="memberFilterOptions"
        @filter="filterMemberFn"
      />
    </div>
    <div class="col-12 col-sm-4 col-md-3 q-py-sm q-my-sm field-shadow" v-if="!isreport">
      <p class="q-mt-none q-mb-xs text-weight-medium">Projects</p>
      <q-select
        v-model="projectModel"
        use-input
        use-chips
        multiple
        outlined
        input-debounce="0"
        @new-value="createProjectValue"
        :options="projectFilterOptions"
        @filter="filterProjectFn"
      />
    </div>
  </div>
  <q-dialog v-model="customRangeDialog">
    <q-card>
      <q-date v-model="customRange" range>
        <div class="row items-center justify-end">
          <q-btn v-close-popup label="OK" color="primary" flat /></div
      ></q-date>
    </q-card>
  </q-dialog>
</template>
<script>
import { ref } from 'vue'
let memberStringOptions = []
let projectStringOptions = []
export default {
  name: 'reportFilter',
  props: {
    tabChange: Boolean,
    isreport: Boolean,
  },
  setup() {
    const memberModel = ref(null)
    const memberFilterOptions = ref(memberStringOptions)
    const projectModel = ref(null)
    const projectFilterOptions = ref(projectStringOptions)

    return {
      memberModel,
      memberFilterOptions,
      projectModel,
      projectFilterOptions,

      createMemberValue(val, done) {
        if (val.length > 0) {
          const modelValue = (memberModel.value || []).slice()

          val
            .split(/[,;|]+/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
            .forEach((v) => {
              if (memberStringOptions.includes(v) === false) {
                memberStringOptions.push(v)
              }
              if (modelValue.includes(v) === false) {
                modelValue.push(v)
              }
            })
          done(null)
          memberModel = ref(modelValue)
        }
      },
      createProjectValue(val, done) {
        if (val.length > 0) {
          const modelValue = (projectModel.value || []).slice()

          val
            .split(/[,;|]+/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
            .forEach((v) => {
              if (projectStringOptions.includes(v) === false) {
                projectStringOptions.push(v)
              }
              if (modelValue.includes(v) === false) {
                modelValue.push(v)
              }
            })
          done(null)
          projectModel.value = modelValue
        }
      },

      filterMemberFn(val, update) {
        update(() => {
          if (val === '') {
            memberFilterOptions.value = memberStringOptions
          } else {
            const needle = val.toLowerCase()
            memberFilterOptions.value = memberStringOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
          }
        })
      },
      filterProjectFn(val, update) {
        update(() => {
          if (val === '') {
            projectFilterOptions.value = projectStringOptions
          } else {
            const needle = val.toLowerCase()
            projectFilterOptions.value = projectStringOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
          }
        })
      },
    }
  },
  created() {
    this.initUserList()
    this.initProjectList()
    this.paymentDateRange = ref({ from: this.getRefDateFormat(new Date(+0)), to: this.getRefDateFormat(new Date()) })
  },
  data() {
    return {
      paymentDateRange: ref({ from: '2022/01/01', to: '2022/01/05' }),
      userSelection: [],
      projectSelection: [],
      reportFilters: {
        startDate: new Date(+0),
        endDate: new Date(),
        memberIds: [],
        projectIds: [],
      },
      customRangeDialog: false,
      customRange: ref({
        from: this.get7DaysBefore(),
        to: this.getRefDateFormat(new Date()),
      }),
      isCustomRange: false,
    }
  },
  methods: {
    initUserList() {
      this.$api
        .get('/user/get-user-list', {})
        .then((res) => {
          this.userSelection = res
          memberStringOptions = []
          this.userSelection.forEach((userInfo) => {
            memberStringOptions.push(userInfo.userName)
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    initProjectList() {
      this.$api
        .get('/project/get-list', {})
        .then((res) => {
          this.projectSelection = res
          projectStringOptions = []
          this.projectSelection.forEach((project) => {
            projectStringOptions.push(project.projectName)
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    setRange(code) {
      let start = new Date()
      let end = new Date()
      let tmpDate
      this.isCustomRange = false
      switch (code) {
        case 0:
          start.setDate(start.getDate() - 1)
          break
        case 1:
          start = new Date(start.getFullYear(), start.getMonth(), 1)
          break
        case 2:
          tmpDate = new Date()
          tmpDate.setMonth(tmpDate.getMonth() - 1)
          start = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), 1)
          end = new Date(tmpDate.getFullYear(), tmpDate.getMonth() + 1, 0)
          break
        case 3:
          start = new Date(start.getFullYear(), 0, 1)
          break
        //last year
        case 4:
          tmpDate = new Date()
          tmpDate.setFullYear(tmpDate.getFullYear() - 1)
          start = new Date(tmpDate.getFullYear(), 0, 1)
          end = new Date(tmpDate.getFullYear(), 11, 31)
          break
        case 5:
          start = new Date(+0)
          break
      }

      this.reportFilters.startDate = start
      this.reportFilters.endDate = end
      this.paymentDateRange = ref({ from: this.getRefDateFormat(start), to: this.getRefDateFormat(end) })
      this.$emit('updateFilter', this.reportFilters)
    },
    getRefDateFormat(date) {
      return ref(
        date.getFullYear() +
          '/' +
          (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) +
          '/' +
          date.getDate()
      )
    },
    getUserInfo(userName) {
      let result = null
      this.userSelection.forEach((userInfo) => {
        if (userInfo.userName == userName) {
          result = userInfo
          return
        }
      })
      return result
    },
    getProjectInfo(projectName) {
      let result = null
      this.projectSelection.forEach((projectInfo) => {
        if (projectInfo.projectName == projectName) {
          result = projectInfo
          return
        }
      })
      return result
    },
    customRangeChoose() {
      ;``
      this.customRangeDialog = true
      this.isCustomRange = true
    },
    get7DaysBefore() {
      const now = new Date()
      now.setDate(now.getDate() - 6)
      return this.getRefDateFormat(now)
    },
    getDateRangeColumnClass() {
      if (this.isreport) {
        return 'center-row q-py-sm q-my-sm field-shadow'
      }
      return 'col-12 col-sm-4 col-md-3 q-py-sm q-my-sm field-shadow'
    },
  },
  watch: {
    memberModel: {
      immediate: true,
      handler(newVal) {
        let memberIds = []
        if (newVal == null) {
          return
        }
        let newSelectedUsers = String(newVal)
        newSelectedUsers
          .split(/[,;|]+/)
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .forEach((v) => {
            let userInfo = this.getUserInfo(v)
            if (userInfo == null) {
              return
            }
            memberIds.push(userInfo.id)
          })
        this.reportFilters.memberIds = memberIds
        this.$emit('updateFilter', this.reportFilters)
      },
    },
    projectModel: {
      immediate: true,
      handler(newVal) {
        let projectIds = []
        if (newVal == null) {
          return
        }
        let newSelectedProjects = String(newVal)
        newSelectedProjects
          .split(/[,;|]+/)
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .forEach((v) => {
            let projectInfo = this.getProjectInfo(v)
            if (projectInfo == null) {
              return
            }
            projectIds.push(projectInfo.projectId)
          })
        this.reportFilters.projectIds = projectIds
        this.$emit('updateFilter', this.reportFilters)
      },
    },
    customRange: {
      immediate: true,
      handler(newVal) {
        if (!this.isCustomRange || !newVal) {
          return
        }
        const startDate = new Date(newVal.from)
        const endDate = new Date(newVal.to)
        this.reportFilters.startDate = startDate
        this.reportFilters.endDate = endDate
        this.paymentDateRange = ref({ from: this.getRefDateFormat(startDate), to: this.getRefDateFormat(endDate) })
        this.$emit('updateFilter', this.reportFilters)
      },
    },
  },
}
</script>

<style scoped>
.invoice-price-detail {
  max-height: 150px;
}
</style>
