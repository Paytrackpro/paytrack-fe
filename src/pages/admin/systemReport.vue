<template>
  <div class="q-pa-lg">
    <div class="row">
      <q-card class="col-12 col-lg-12 q-pa-md q-mb-lg content-container">
        <div class="text-h6 title-case">System Report</div>
        <div class="q-ma-md text-size-15">
          <div class="row q-mb-xs q-col-gutter-md">
            <div class="col-12 col-sm-6 col-lg-3 col-xl-3 q-py-xs q-my-xs">
              <p class="q-mb-sm">
                <span class="text-weight-medium">Total Invoices:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ totalInvoices }}</span>
              </p>
              <p class="q-mb-sm">
                <span class="text-weight-medium">Total Amount:&nbsp;</span>
                <span class="text-size-20">${{ totalAmount }}</span>
              </p>
            </div>
            <div class="col-12 col-sm-6 col-lg-7 q-py-xs q-my-xs">
              <p class="q-mb-sm">
                <span class="text-weight-medium">Sent Invoices:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ sentInvoiceInfo.count }}</span>
                <span>&nbsp;(</span>
                <span class="text-weight-medium">Amount:&nbsp;&nbsp;</span>
                <span class="text-size-20">${{ sentInvoiceInfo.amount }}</span>
                <span>)</span>
              </p>
              <p class="q-mb-sm">
                <span class="text-weight-medium">Payable Invoices:&nbsp;&nbsp;</span>
                <span class="text-size-20">{{ pendingInvoiceInfo.count }}</span>
                <span>&nbsp;(</span>
                <span class="text-weight-medium">Amount:&nbsp;&nbsp;</span>
                <span class="text-size-20">${{ pendingInvoiceInfo.amount }}</span>
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
    </div>
    <div class="row">
      <q-table
        title="Users Usage Detail"
        :rows="rows"
        :columns="columns"
        row-key="name"
        flat
        class="col-12 col-lg-12"
        separator="none"
        v-model:pagination="pagination"
        :hide-pagination="pagination.rowsNumber < 10"
        :class="pagination.rowsNumber <= pagination.rowsPerPage ? 'hide-pagination-number' : ''"
        :loading="loading"
        @request="onRequest"
      >
        <template v-slot:pagination>
          <custom-pagination :pagination="pagination" :color="'primary'" />
        </template>
        <template v-slot:top-right>
          <report-filter @updateFilter="updateFilter" isreport></report-filter>
        </template>
        <template v-slot:body-cell-online="props">
          <q-td :props="props">
            <q-badge rounded :color="props.value ? 'green' : 'grey'" />
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import customPagination from 'src/components/common/custom_pagination.vue'
import reportFilter from 'components/report/reportFilter'

export default {
  name: 'systemReport',
  props: {
    type: String,
  },
  components: {
    customPagination,
    reportFilter,
  },
  data() {
    return {
      loading: false,
      pagination: { ...defaultPaging },
      columns: [
        {
          name: 'username',
          required: true,
          label: 'User Name',
          align: 'center',
          field: (row) => row.userName,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: 'send',
          align: 'center',
          label: 'Send Invoices',
          field: 'sendNum',
          sortable: true,
        },
        {
          name: 'receive',
          align: 'center',
          label: 'Receive Invoices',
          field: 'receiveNum',
          sortable: true,
        },
        {
          name: 'paid',
          align: 'center',
          label: 'Paid Invoices',
          field: 'paidNum',
          sortable: true,
        },
        {
          name: 'sendusd',
          align: 'center',
          label: 'Send Amount',
          field: 'sentUsd',
          sortable: true,
          format: (val) => {
            return '$ ' + val.toFixed(2)
          },
        },
        {
          name: 'receiveusd',
          align: 'center',
          label: 'Receive Amount',
          field: 'receiveUsd',
          sortable: true,
          format: (val) => {
            return '$ ' + val.toFixed(2)
          },
        },
        {
          name: 'paidusd',
          align: 'center',
          label: 'Paid Amount',
          field: 'paidUsd',
          sortable: true,
          format: (val) => {
            return '$ ' + val.toFixed(2)
          },
        },
      ],
      reportFilters: {
        StartDate: null,
        EndDate: null,
        page: null,
        size: null,
        order: null,
      },
      rows: [],
      totalInvoices: 0,
      totalAmount: 0,
      sentInvoiceInfo: {
        count: 0,
        amount: 0,
      },
      pendingInvoiceInfo: {
        count: 0,
        amount: 0,
      },
      paidInvoiceInfo: {
        count: 0,
        amount: 0,
      },
    }
  },
  created() {
    this.reportFilters.StartDate = new Date(+0)
    this.reportFilters.EndDate = new Date()
    this.getReportSummary()
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const filter = pathParamsToPaging(to, this.pagination)
        this.reportFilters.page = filter.page
        this.reportFilters.size = filter.size
        this.reportFilters.order = filter.order
        this.getReportSummary()
      },
    },
  },
  methods: {
    async getReportSummary() {
      this.loading = true
      if (!this.reportFilters.StartDate) {
        this.reportFilters.StartDate = new Date(+0)
      }
      if (!this.reportFilters.EndDate) {
        this.reportFilters.EndDate = new Date()
      }
      this.$api
        .get('/admin/report-summary', {
          params: this.reportFilters,
        })
        .then(({ report, count }) => {
          this.rows = report.userUsageSummary || []
          this.pagination.rowsNumber = count
          this.loading = false
          this.totalInvoices = report.totalInvoices
          this.totalAmount = report.totalAmount
          this.sentInvoiceInfo.count = report.sentInvoices.invoiceNum
          this.sentInvoiceInfo.amount = report.sentInvoices.amount
          this.pendingInvoiceInfo.count = report.payableInvoices.invoiceNum
          this.pendingInvoiceInfo.amount = report.payableInvoices.amount
          this.paidInvoiceInfo.count = report.paidInvoices.invoiceNum
          this.paidInvoiceInfo.amount = report.paidInvoices.amount
        })
        .catch((err) => {
          this.loading = false
        })
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      query.s = props.filter
      this.$router.push({
        path: this.$route.fullPath,
        query,
      })
    },
    updateFilter(data) {
      this.reportFilters.StartDate = data.startDate
      this.reportFilters.EndDate = data.endDate
      this.getReportSummary()
    },
  },
}
</script>
<style lang="scss">
.list-user-header .list-user-icon-sort {
  display: flex;
  width: 100px;
}

.list-user-header:hover .list-user-icon-sort {
  display: block;
}
</style>
