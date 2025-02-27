<template>
  <q-page class="content">
    <q-card class="q-ma-lg content-container">
      <q-card-section class="card-header">
        <div class="row justify-between">
          <div class="text-h6 title-case">User Report Detail</div>
        </div>
      </q-card-section>
    </q-card>
    <q-card class="q-ma-lg content-container">
      <q-card class="col-12 q-pa-md q-mb-lg content-container">
        <div class="text-h6 title-case">Summary Information</div>
        <div class="q-ma-md text-size-15">
          <div class="row q-mb-xs q-col-gutter-md">
            <div class="col-12 col-sm-6 col-lg-3 col-xl-3 q-py-xs q-my-xs">
              <p class="q-mb-sm">
                <span class="text-weight-medium">User Name:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ userName }}</span>
              </p>
              <p class="q-mb-sm">
                <span class="text-weight-medium">Total Invoices:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ totalInvoices }}</span>
              </p>
              <p class="q-mb-sm">
                <span class="text-weight-medium">Total Amount:&nbsp;</span>
                <span class="text-size-20">${{ totalAmount }}</span>
              </p>
            </div>

            <div class="col-12 col-sm-6 col-lg-3 col-xl-3 q-py-xs q-my-xs">
              <p class="q-mb-sm">
                <span class="text-weight-medium">Sent Invoices:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ sentInvoiceInfo.count }}</span>
                <span>&nbsp;(</span>
                <span class="text-weight-medium">Amount:&nbsp;&nbsp;</span>
                <span class="text-size-20">${{ sentInvoiceInfo.amount }}</span>
                <span>)</span>
              </p>
              <p class="q-mb-sm">
                <span class="text-weight-medium">Received Invoices:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ receivedInvoiceInfo.count }}</span>
                <span>&nbsp;(</span>
                <span class="text-weight-medium">Amount:&nbsp;&nbsp;</span>
                <span class="text-size-20">${{ receivedInvoiceInfo.amount }}</span>
                <span>)</span>
              </p>
              <p class="q-mb-sm">
                <span class="text-weight-medium">Paid Invoices:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ paidInvoiceInfo.count }}</span>
                <span>&nbsp;(</span>
                <span class="text-weight-medium">Amount:&nbsp;&nbsp;</span>
                <span class="text-size-20">${{ paidInvoiceInfo.amount }}</span>
                <span>)</span>
              </p>
            </div>
          </div>
        </div>
      </q-card>
    </q-card>
    <q-card class="q-ma-lg content-container">
      <q-table
        title="Payments"
        :rows="rows"
        :columns="columns"
        row-key="userName"
        flat
        class="col-12 q-pa-md"
        separator="none"
        v-model:pagination="pagination"
        :hide-pagination="pagination.rowsNumber < 10"
        :class="
          pagination.rowsNumber <= pagination.rowsPerPage || pagination.rowsPerPage == 0 ? 'hide-pagination-number' : ''
        "
        :loading="loading"
        :rows-per-page-options="rppOptions"
        @request="onRequest"
        @row-click="(_, row) => goToDetail(row)"
      >
        <template v-slot:pagination>
          <q-pagination
            v-model="pagination.page"
            :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
            :color="'primary'"
          />
        </template>
        <template v-slot:top-right>
          <div class="row q-gutter-md items-center justify-between">
            <div class="row q-gutter-x-md">
              <q-checkbox
                v-for="filter in filterOptions"
                :key="filter.value"
                v-model="currentFilter[filter.value]"
                :label="filter.label"
                color="primary"
              />
            </div>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging, getRppOps } from 'src/helper/paging'

export default {
  name: 'ReportPaymentForUser',
  data() {
    return {
      userName: null,
      totalInvoices: 0,
      totalAmount: 0,
      sentInvoiceInfo: { count: 0, amount: 0 },
      paidInvoiceInfo: { count: 0, amount: 0 },
      receivedInvoiceInfo: { count: 0, amount: 0 },
      currentFilter: {
        sent: false,
        received: false,
        paid: false,
        hasBeenPaid: false,
        username: null,
        page: 1,
        size: 10,
        order: null,
      },
      filterOptions: [
        { label: 'Sent', value: 'sent' },
        { label: 'Received', value: 'received' },
        { label: 'Paid', value: 'paid' },
        { label: 'Got Paid', value: 'hasBeenPaid' },
      ],
      columns: [
        {
          name: 'sender',
          label: 'Sender',
          field: 'sender',
          align: 'center',
          sortable: true,
        },
        {
          name: 'receiver',
          label: 'Receiver',
          field: 'receiver',
          align: 'center',
          sortable: true,
        },
        {
          name: 'status',
          label: 'Status',
          field: 'status',
          align: 'center',
          sortable: false,
        },
        {
          name: 'acceptedCoin',
          label: 'Accepted Coins',
          field: 'acceptedCoin',
          align: 'center',
          sortable: false,
          format: (val) => val?.toUpperCase(),
        },
        {
          name: 'amount',
          label: 'Amount(USD)',
          field: 'amount',
          align: 'center',
          sortable: true,
          format: (val) => {
            return '$ ' + val.toFixed(2)
          },
        },
        {
          name: 'startDate',
          label: 'Start Date',
          field: 'startDate',
          align: 'center',
          sortable: true,
          format: (val) => {
            if (!val) return '(None)'
            const date = new Date(val)
            return date.toISOString().replace('T', ' ').slice(0, 19)
          },
        },
        {
          name: 'lastEdited',
          label: 'Last Edited',
          field: 'lastEdited',
          align: 'center',
          sortable: true,
          format: (val) => {
            if (!val) return '(None)'
            const date = new Date(val)
            return date.toISOString().replace('T', ' ').slice(0, 19)
          },
        },
      ],
      rows: [],
      loading: false,
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
      rppOptions: [0, 5, 10, 15, 20],
      rppDefaultOptions: [0, 5, 10, 15, 20],
    }
  },
  created() {
    this.userName = this.$route.params.userName || 'Anonymous'
    this.currentFilter.username = this.userName
    this.getReportDetailUser()
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const filter = pathParamsToPaging(to, this.pagination, true)
        this.currentFilter.page = filter.page
        this.currentFilter.size = filter.size
        this.currentFilter.order = filter.order
        this.getReportDetailUser()
      },
    },
    userName: {
      immediate: false,
      handler(newValue) {
        if (newValue) {
          this.currentFilter.username = newValue
          this.getReportDetailUser()
        }
      },
    },
    filterValues: {
      handler() {
        this.getReportDetailUser()
      },
      deep: true,
    },
  },
  computed: {
    filterValues() {
      return {
        sent: this.currentFilter.sent,
        received: this.currentFilter.received,
        paid: this.currentFilter.paid,
        hasBeenPaid: this.currentFilter.hasBeenPaid,
      }
    },
  },
  methods: {
    async getReportDetailUser() {
      this.loading = true
      try {
        const { report, count } = await this.$api.get('/admin/report-summary-user', {
          params: this.currentFilter,
        })
        this.rows = report.userDetailUsageSummary || []
        this.pagination.rowsNumber = count
        this.totalInvoices = report.totalInvoices
        this.totalAmount = report.totalAmount
        this.sentInvoiceInfo.count = report.sentInvoices.invoiceNum
        this.sentInvoiceInfo.amount = report.sentInvoices.amount
        this.pendingInvoiceInfo.count = report.payableInvoices.invoiceNum
        this.pendingInvoiceInfo.amount = report.payableInvoices.amount
        this.paidInvoiceInfo.count = report.paidInvoices.invoiceNum
        this.paidInvoiceInfo.amount = report.paidInvoices.amount
        this.rppOptions = getRppOps(this.rppDefaultOptions, count)
      } catch (err) {
        console.error('Error fetching report:', err)
      } finally {
        this.loading = false
      }
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      query.s = props.filter
      this.$router.push({
        path: this.$route.fullPath,
        query,
      })
    },
  },
}
</script>

<style scoped></style>
