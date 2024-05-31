<template>
  <q-card class="q-ma-lg content-container">
    <q-card-section class="card-header">
      <div class="row justify-between">
        <div class="row">
          <div class="text-h6 title-case">Time Logs</div>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-md q-pb-xs">
      <report-filter @updateFilter="updateFilter" isreport></report-filter>
    </q-card-section>
    <q-card-section class="q-pt-xs">
      <div class="row">
        <div class="col-12">
          <q-card class="no-shadow outlined">
            <div class="row text-weight-medium report-header-table">
              <span class="col-4 text-center">Date</span>
              <span class="col-4 text-center">Working Time</span>
            </div>
          </q-card>
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              expand-separator
              icon="perm_identity"
              class="report-row-header"
              v-for="(timelog, i) of timelogList"
              :key="i"
            >
              <template v-slot:header>
                <q-item-section>
                  <div class="row">
                    <span class="col-4 text-center">
                      <span class="fw-600">Start:&nbsp;</span><m-time :time="timelog.start" dateTimeOnly></m-time>
                    </span>
                    <span class="col-4 text-center padding-30">{{ getWorkingTimeDisplay(timelog.duration) }}</span>
                  </div>
                </q-item-section>
              </template>
              <q-separator />
              <q-card>
                <q-card-section class="no-pm-top">
                  <div class="row q-mt-lg">
                    <div class="col-12 col-sm-4">
                      <span class="col-4 d-flex justify-content-center">
                        <span class="fw-600">Finish:&nbsp;</span><m-time :time="timelog.stop" dateTimeOnly></m-time>
                      </span>
                    </div>
                  </div>
                  <div class="row q-mt-lg">
                    <div class="col-12 col-sm-4 d-flex justify-content-center">
                      <span class="text-center center-row q-mr-sm">Project</span>
                      <q-select
                        v-model="timelog.projectId"
                        :options="projectOption"
                        outlined
                        dense
                        style="max-width: 250px"
                        lazy-rules
                        stack-label
                        emit-value
                        map-options
                        borderless
                        class="timer-project-select"
                        @update:model-value="projectChange(i, timelog.projectId)"
                      />
                    </div>
                    <div class="col-12 col-sm-6 col-lg-4 d-flex justify-content-center">
                      <div>
                        <div class="center-row">
                          <b class="text-weight-medium">Description</b>
                          <div class="q-ml-sm">
                            <q-btn
                              v-if="!descEditStatuses[i]"
                              size="sm"
                              class="timer-btc-icon q-mr-xs"
                              flat
                              color="grey"
                              icon="edit"
                              @click="openEditDesc(i)"
                            />
                            <q-btn
                              v-if="descEditStatuses[i]"
                              size="sm"
                              class="timer-btc-icon q-mr-xs"
                              flat
                              color="green"
                              icon="check"
                              @click="updateDescription(i)"
                            />
                            <q-btn
                              v-if="descEditStatuses[i]"
                              size="sm"
                              class="timer-btc-icon q-mr-xs"
                              flat
                              color="red"
                              icon="close"
                              @click="cancelDescEdit(i)"
                            />
                          </div>
                        </div>
                        <q-input
                          v-if="descEditStatuses[i]"
                          class="width-200"
                          v-model="descContentTemp[i]"
                          dense
                          outlined
                          stack-label
                          auto
                          rows="3"
                          hide-bottom-space
                          type="textarea"
                          placeholder="Description for time log"
                        />
                        <p v-if="!descEditStatuses[i]">{{ timelog.description }}</p>
                      </div>
                    </div>
                    <div class="col-12 col-sm-2 col-lg-4 d-flex justify-content-center">
                      <div>
                        <q-btn
                          label="Delete"
                          type="button"
                          color="red"
                          @click="prepareDeleteTimer(i)"
                          class="q-mr-sm btn btn-animated"
                        />
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
          <div class="d-flex justify-content-end">
            <custom-pagination
              v-if="pagination.rowsNumber > 10"
              :pagination="pagination"
              :color="'primary'"
              class="q-mt-md"
            />
          </div>
        </div>
      </div>
      <q-dialog v-model="confirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="primary" text-color="white" size="md" />
            <span class="q-ml-sm">Are you sure to delete this working time log?</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat unelevated rounded label="Delete" color="primary" v-close-popup @click="deleteTimeLog()" />
            <q-btn flat unelevated rounded label="Cancel" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card-section>
  </q-card>
</template>

<script>
import reportFilter from 'components/report/reportFilter'
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import customPagination from 'src/components/common/custom_pagination.vue'
import { MDateFormat } from 'src/consts/common'
import { date } from 'quasar'
import MTime from 'components/common/mTime'
export default {
  name: 'timelogPage',
  components: {
    reportFilter,
    MTime,
    customPagination,
  },
  data() {
    return {
      reportFilters: {
        StartDate: null,
        EndDate: null,
        page: null,
        size: null,
        order: null,
      },
      timelogList: [],
      pagination: { ...defaultPaging },
      projectList: [],
      projectOption: [],
      descEditStatuses: [],
      descContentTemp: [],
      confirm: false,
      deleteIndex: -1,
    }
  },
  created() {
    this.reportFilters.StartDate = new Date(+0)
    this.reportFilters.EndDate = new Date()
    this.initTimeLogList()
    this.initProjectList()
  },
  methods: {
    updateFilter(data) {
      this.reportFilters.StartDate = data.startDate
      this.reportFilters.EndDate = data.endDate
      this.initTimeLogList()
    },
    async initTimeLogList() {
      if (!this.reportFilters.StartDate) {
        this.reportFilters.StartDate = new Date(+0)
      }
      if (!this.reportFilters.EndDate) {
        this.reportFilters.EndDate = new Date()
      }
      this.$api
        .get('/user/get-time-log', {
          params: this.reportFilters,
        })
        .then((res) => {
          this.timelogList = res.timers
          this.pagination.rowsNumber = res.count
          this.timelogList.forEach((timelog) => {
            this.descEditStatuses.push(false)
            this.descContentTemp.push(timelog.description)
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    getFormatDate(dateVal) {
      return date.formatDate(dateVal, MDateFormat)
    },
    getWorkingTimeDisplay(durVal) {
      var hour = Math.floor(durVal / 3600)
      var timeHour = ''
      if (hour > 0) {
        timeHour = hour + 'h '
      }
      var timeMin = Math.floor((durVal / 60) % 60)
      var timMinDisp = timeMin > 0 ? Math.floor((durVal / 60) % 60) + 'min ' : ''
      var timeSecond = parseInt(durVal % 60)
      return timeHour + timMinDisp + timeSecond + 's'
    },
    pad(val) {
      return val > 9 ? val : '0' + val
    },
    initProjectList() {
      this.$api
        .get('/project/get-list', {})
        .then((res) => {
          this.projectList = res
          if (this.projectOption.length < 1) {
            this.projectOption.push({
              label: 'None',
              value: 0,
            })
            this.projectList.forEach((project) => {
              this.projectOption.push({
                label: project.projectName,
                value: project.projectId,
              })
            })
          }
        })
        .catch((err) => {
          responseError(err)
        })
    },
    openEditDesc(index) {
      this.descEditStatuses[index] = true
    },
    cancelDescEdit(index) {
      this.descEditStatuses[index] = false
      this.descContentTemp[index] = this.timelogList[index].description
    },
    projectChange(index, projectId) {
      var params = {
        timerId: this.timelogList[index].id,
        projectId: projectId,
      }
      this.$api
        .put('user/update-timer', params)
        .then((res) => {
          this.timelogList[index] = res
        })
        .catch((err) => {
          responseError(err)
        })
    },
    updateDescription(index) {
      if (this.descContentTemp[index] == this.timelogList[index].description) {
        this.cancelDescEdit(index)
        return
      }
      var params = {
        timerId: this.timelogList[index].id,
        projectId: -1,
        description: this.descContentTemp[index],
      }
      this.$api
        .put('user/update-timer', params)
        .then((res) => {
          this.timelogList[index] = res
          this.cancelDescEdit(index)
        })
        .catch((err) => {
          responseError(err)
        })
    },
    deleteTimeLog() {
      if (this.deleteIndex < 0) {
        this.$q.notify({
          type: 'negative',
          message: `Delete Timer failed`,
        })
        return
      }
      //delete handler timer
      var deleteTimer = this.timelogList[this.deleteIndex]
      if (!deleteTimer) {
        return
      }
      this.$api
        .delete(`/user/timer-delete/${deleteTimer.id}`)
        .then(() => {
          this.$q.notify({
            message: 'Working Time log has been deleted',
            color: 'positive',
            icon: 'check',
          })
          this.initTimeLogList()
          this.deleteIndex = -1
        })
        .catch((err) => {
          responseError(err)
        })
    },
    prepareDeleteTimer(index) {
      this.deleteIndex = index
      this.confirm = true
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const filter = pathParamsToPaging(to, this.pagination)
        this.reportFilters.page = filter.page
        this.reportFilters.size = filter.size
        this.reportFilters.order = filter.order
        this.initTimeLogList()
      },
    },
  },
}
</script>

<style></style>
