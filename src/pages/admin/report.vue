<template>
  <q-card class="q-ma-lg content-container">
    <q-card-section class="card-header">
      <div class="row justify-between">
        <div class="row">
          <div class="text-h6 title-case">Summary Report</div>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-md">
      <report-filter @updateFilter="updateFilter" :tabChange="tabChange"></report-filter>
      <q-tabs align="left" v-model="tab" inline-label active-class="tab-active">
        <q-tab label="Payment Report" icon="analytics" name="payment" no-caps class="tab-item" />
        <q-tab label="Invoice Summary" icon="summarize" name="invoice" no-caps class="tab-item" />
        <q-tab label="Payment Address" icon="sports_score" name="address" no-caps class="tab-item" />
      </q-tabs>
      <q-separator />
    </q-card-section>
    <q-card-section>
      <q-skeleton v-if="loading" height="150px" />
      <q-tab-panels
        v-else
        class="q-mx-none"
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="jump-up"
        transition-next="jump-down"
      >
        <q-tab-panel class="q-pa-none" name="payment">
          <div class="row">
            <div class="col-12">
              <q-card class="no-shadow outlined">
                <div class="row text-weight-medium report-header-table">
                  <span class="col-4 text-center">Month</span>
                  <span class="col-4 text-center">Amout(USD)</span>
                </div>
              </q-card>
              <q-list bordered class="rounded-borders">
                <q-expansion-item
                  v-model="paymentReportExpansion[i]"
                  expand-separator
                  icon="perm_identity"
                  class="report-row-header"
                  v-for="(paymentReport, i) of paymentReportList"
                  :key="i"
                >
                  <template v-slot:header>
                    <q-item-section>
                      <div class="row">
                        <span class="col-4 text-center">{{ paymentReport.month }}</span>
                        <span class="col-4 text-center padding-30"
                          >$&nbsp;{{ getPaymentReportAmount(paymentReport) }}</span
                        >
                      </div>
                    </q-item-section>
                  </template>
                  <q-separator />
                  <q-card>
                    <q-card-section class="no-pm-top">
                      <div class="row q-mt-lg" v-for="(paymentUnit, j) of paymentReport.paymentUnits" :key="j">
                        <span class="col-4 text-center">{{ paymentUnit.displayName }}</span>
                        <span class="col-4 text-center">$&nbsp;{{ paymentUnit.amount }}</span>
                        <span class="col-4 text-center" v-if="paymentUnit.paymentMethod != ''">{{
                          paymentUnit.expectedAmount + ' (' + paymentUnit.paymentMethod.toUpperCase() + ')'
                        }}</span>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel class="q-pa-none" name="invoice">
          <div class="row">
            <div class="col-12">
              <q-card class="no-shadow outlined">
                <div class="row text-weight-medium report-header-table">
                  <span class="col-4 text-center">Project</span>
                  <span class="col-4 text-center">User</span>
                  <span class="col-4 text-center">Total Hours</span>
                </div>
              </q-card>
              <q-list bordered class="rounded-borders">
                <q-expansion-item
                  v-model="invoiceReportExpansion[i]"
                  expand-separator
                  class="report-row-header"
                  v-for="(invoiceKey, i) of invoiceReportKey"
                  :key="i"
                >
                  <template v-slot:header>
                    <q-item-section>
                      <div class="row">
                        <span class="col-4 text-center">{{
                          invoiceKey.split(';')[1] == '' ? '#' : invoiceKey.split(';')[1]
                        }}</span>
                        <span class="col-4 text-center padding-30">{{ invoiceKey.split(';')[0] }}</span>
                        <span class="col-4 text-center padding-80"
                          >{{ getTotalHours(invoiceKey).toFixed(2) }} hour(s)</span
                        >
                      </div>
                    </q-item-section>
                  </template>
                  <q-separator />
                  <q-card>
                    <q-card-section class="no-pm-top">
                      <div class="row q-mt-lg" v-for="(invoiceUnit, j) of invoiceReportList[invoiceKey]" :key="j">
                        <span class="col-4 text-center">{{ invoiceUnit.date }}</span>
                        <span class="col-4 text-center">{{ invoiceUnit.description }}</span>
                        <span class="col-4 text-center">{{ invoiceUnit.hours.toFixed(2) }}&nbsp;hour(s)</span>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel class="q-pa-none" name="address">
          <div class="row">
            <div class="col-12">
              <q-card class="no-shadow outlined">
                <div class="row text-weight-medium report-header-table">
                  <span class="col-4 text-center">Address</span>
                  <span class="col-4 text-center">Payment Method</span>
                  <span class="col-4 text-center">Display Name</span>
                </div>
              </q-card>
              <q-list bordered class="rounded-borders">
                <q-expansion-item
                  v-model="addressReportExpansion[i]"
                  expand-separator
                  icon="perm_identity"
                  v-for="(address, i) of addressReportKey"
                  :key="i"
                  class="report-row-header"
                >
                  <template v-slot:header>
                    <q-item-section>
                      <div class="row">
                        <span class="col-4 text-center">{{ address }}</span>
                        <span class="col-4 text-center padding-30">{{
                          addressReportList[address].paymentMethod.toUpperCase()
                        }}</span>
                        <span class="col-4 text-center padding-80">{{ addressReportList[address].displayName }}</span>
                      </div>
                    </q-item-section>
                  </template>
                  <q-separator />
                  <q-card>
                    <q-card-section class="no-pm-top">
                      <div
                        class="row q-mt-lg"
                        v-for="(addressUnit, j) of addressReportList[address].addressUnits"
                        :key="j"
                      >
                        <span class="col-4 text-center">{{ addressUnit.dateTime }}</span>
                        <span class="col-4 text-center"
                          >{{ addressUnit.expectedAmount }}&nbsp;{{
                            addressReportList[address].paymentMethod.toUpperCase()
                          }}</span
                        >
                        <span class="col-4 text-center">$&nbsp;{{ addressUnit.amount }}</span>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapGetters } from 'vuex'
import reportFilter from 'components/report/reportFilter'
import {
  DESTINATION_CHECK_NONE,
  DESTINATION_CHECK_DONE,
  DESTINATION_CHECK_CHECKING,
  DESTINATION_CHECK_FAIL,
} from 'src/consts/common'

export default {
  name: 'reportPage',
  components: {
    reportFilter,
  },
  data() {
    return {
      tab: 'payment',
      loading: false,
      monthChoose: [],
      selectedMonth: 1,
      paymentSummary: {},
      payees: {
        ids: [],
        usernames: [],
        value: '',
        status: DESTINATION_CHECK_NONE,
        error: '',
      },
      reportFilters: {
        StartDate: null,
        EndDate: null,
        MemberIds: '',
        ProjectIds: '',
      },
      dialogOpen: false,
      expansionItem: false,
      paymentReportList: [],
      invoiceReportList: [],
      addressReportList: [],
      paymentReportExpansion: [],
      addressReportExpansion: {},
      invoiceReportExpansion: {},
      invoiceReportKey: [],
      addressReportKey: [],
      tabChange: false,
    }
  },
  created() {
    this.reportFilters.StartDate = new Date(+0)
    this.reportFilters.EndDate = new Date()
    if (this.tab == 'payment') {
      this.initPaymentReportList()
    } else if (this.tab == 'invoice') {
      this.initInvoiceReportList()
    } else if (this.tab == 'address') {
      this.initAddressReportList()
    }
  },
  methods: {
    updateFilter(data) {
      this.reportFilters.StartDate = data.startDate
      this.reportFilters.EndDate = data.endDate
      this.reportFilters.MemberIds = data.memberIds.length > 0 ? data.memberIds.join(',') : ''
      this.reportFilters.ProjectIds = data.projectIds.length > 0 ? data.projectIds.join(',') : ''
      if (this.tab == 'payment') {
        this.initPaymentReportList()
      } else if (this.tab == 'invoice') {
        this.initInvoiceReportList()
      } else if (this.tab == 'address') {
        this.initAddressReportList()
      }
    },
    getPaymentSummary(month) {
      this.$api
        .get('/payment/monthly-summary', {
          params: {
            month: month,
            ids: this.payees.ids.map((item) => item).join(','),
          },
        })
        .then(({ summary }) => {
          this.paymentSummary.requestReceived = summary.RequestReceived
          this.paymentSummary.requestSent = summary.RequestSent
          this.paymentSummary.requestPaid = summary.RequestPaid
          this.paymentSummary.totalPaid = summary.TotalPaid
          this.paymentSummary.totalReceived = summary.TotalReceived
        })
        .catch((err) => {
          responseError(err)
          this.loading = false
        })
    },
    checkValidPayees() {
      this.payees.status = DESTINATION_CHECK_CHECKING
      const value = this.payees.value.replace(/,\s*$/, '')
      this.payees.value = value
      this.$api
        .get(`/user/exists?userNames=${value}`)
        .then((data) => {
          if (data && data.length) {
            this.payees.status = DESTINATION_CHECK_DONE
            this.payees.ids = data.map((item) => item.id)
            this.payees.usernames = data.map((item) => item.userName)
          } else {
            this.payees.status = DESTINATION_CHECK_FAIL
            this.payees.usernames = []
            this.payees.error = data.message
            return
          }
          this.getPaymentSummary(this.selectedMonth)
        })
        .catch((err) => {
          this.payees.status = DESTINATION_CHECK_FAIL
          this.payees.error = err.message || 'the user name is not found'
          this.payees.usernames = []
        })
    },
    async initPaymentReportList() {
      this.paymentReportExpansion = []
      this.$api
        .get('/payment/payment-report', {
          params: this.reportFilters,
        })
        .then((res) => {
          this.paymentReportList = res
          res.forEach((item) => {
            this.paymentReportExpansion.push(false)
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    async initInvoiceReportList() {
      this.invoiceReportExpansion = []
      this.invoiceReportKey = []
      this.invoiceReportList = {}
      this.$api
        .get('/payment/invoice-report', {
          params: this.reportFilters,
        })
        .then((res) => {
          this.invoiceReportList = res
          Object.keys(res).forEach((item) => {
            this.invoiceReportExpansion.push(false)
            this.invoiceReportKey.push(item)
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    async initAddressReportList() {
      this.addressReportList = {}
      this.addressReportKey = []
      this.addressReportExpansion = []
      this.$api
        .get('/payment/address-report', {
          params: this.reportFilters,
        })
        .then((res) => {
          this.addressReportList = res
          Object.keys(res).forEach((item) => {
            this.addressReportExpansion.push(false)
            this.addressReportKey.push(item)
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    getPaymentReportAmount(paymentReport) {
      if (!paymentReport.paymentUnits || paymentReport.paymentUnits.length < 1) {
        return ''
      }
      let totalCost = 0
      paymentReport.paymentUnits.forEach((unit) => {
        totalCost += unit.amount
      })
      return totalCost
    },
    getTotalHours(invoiceKey) {
      const invoiceReport = this.invoiceReportList[invoiceKey]
      let totalHours = 0
      invoiceReport.forEach((item) => {
        totalHours += item.hours
      })
      return totalHours
    },
  },
  beforeMount() {
    const nowMonth = new Date().getMonth() + 1
    let count = 1
    while (count <= nowMonth) {
      this.monthChoose.push(count)
      count++
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    payeesError: function () {
      return this.payees.status === DESTINATION_CHECK_FAIL
    },
  },
  watch: {
    selectedMonth: {
      immediate: true,
      handler(newMonth) {
        this.getPaymentSummary(newMonth)
      },
    },
    tab: {
      immediate: true,
      handler(newTab) {
        if (this.reportFilters.StartDate == null && this.reportFilters.EndDate == null) {
          return
        }
        this.reportFilter = {
          StartDate: new Date(+0),
          EndDate: new Date(),
          MemberIds: '',
          ProjectIds: '',
        }
        this.tabChange = !this.tabChange
        if (newTab == 'payment') {
          this.initPaymentReportList()
        } else if (newTab == 'invoice') {
          this.initInvoiceReportList()
        } else if (newTab == 'address') {
          this.initAddressReportList()
        }
      },
    },
  },
}
</script>

<style></style>
