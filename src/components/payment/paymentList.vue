<template>
  <div class="row q-mt-lg">
    <div class="text-bold text-grey-3" align="left" v-if="type !== 'approval' && !isBulkPay">
      <q-btn
        :label="hidePaid ? 'Show Paid' : 'Hide paid'"
        type="button"
        :color="hidePaid ? 'secondary' : 'primary'"
        @click="hidePaidHandler()"
        class="q-mr-sm btn btn-animated"
      />
    </div>
    <div class="col row text-bold text-grey-3" align="left" v-if="type !== 'approval' && !isBulkPay">
      <p class="q-mt-none q-mb-xs q-mr-sm text-weight-medium">
        {{ type === 'reminder' ? 'Filter by Sender:' : 'Filter by Recipient:' }}
      </p>
      <q-select
        v-model="memberModel"
        use-input
        use-chips
        multiple
        outlined
        input-debounce="0"
        :options="memberFilterOptions"
        @filter="filterMemberFn"
      />
    </div>
    <div class="col" align="right">
      <q-btn
        v-if="type !== 'reminder'"
        label="Create Request"
        icon="add"
        class="q-mr-sm"
        color="primary"
        to="/get-paid/create"
      />
      <template v-if="showBulkPay">
        <q-btn
          label="Bulk Pay BTC"
          class="q-mr-sm"
          color="primary"
          @click="onBulkPay"
          v-show="isBulkPay"
          :disable="selected.length == 0"
          style="margin-left: 10px"
        />
        <q-btn
          :label="isBulkPay ? 'Cancel' : 'Show Bulk Pay BTC'"
          type="button"
          :text-color="isBulkPay ? 'black' : 'white'"
          :color="isBulkPay ? 'white' : 'primary'"
          @click="setIsBulkPay()"
          class="btn btn-animated"
        />
      </template>
    </div>
  </div>
  <div class="row q-mt-md">
    <div v-if="isShowList" class="col-12 q-py-lg">
      <q-table
        :title="label || 'Payments'"
        :loading="loading"
        :rows="rows"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        v-model:selected="selected"
        :selection="isBulkPay ? 'multiple' : 'none'"
        :no-data-label="
          type === 'request' ? 'Click Create above to generate a payment request' : 'No payment requests received yet'
        "
        :hide-pagination="pagination.rowsNumber < 10"
        separator="none"
        :class="pagination.rowsNumber <= pagination.rowsPerPage ? 'hide-pagination-number' : ''"
        flat
        @row-click="(_, row) => goToDetail(row.id)"
        @request="onRequest"
      >
        <template v-if="type === 'reminder'" v-slot:top>
          <div class="q-table__title">{{ label || 'Payments' }}</div>
          <q-space />
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <payment-status :paymentModel="props.row" isShowApprover :isShowIcon="false" />
          </q-td>
        </template>
        <template v-slot:body-cell-updatedAt="props">
          <q-td :props="props">
            <m-time :time="props.row.updatedAt"></m-time>
          </q-td>
        </template>
        <template v-slot:no-data="{ message }">
          <div class="full-width row flex-center q-gutter-sm">
            <span>
              {{ message }}
            </span>
          </div>
        </template>
        <template v-slot:pagination>
          <custom-pagination :pagination="pagination" :color="'primary'" />
        </template>
      </q-table>
      <q-dialog v-model="detailBulk">
        <q-card class="bulk-pay-dialog">
          <q-card-section class="row justify-between q-py-sm">
            <div class="text-h6">Bulk Pay BTC</div>
            <q-btn v-if="!rateLoading" class="refresh-btn" round dense flat @click="refreshExchangeRate">
              <span>Refresh Exchange Rate</span>
              <q-icon size="md" class="custom-icon" :name="'o_refresh'" />
            </q-btn>
            <q-spinner-oval v-else color="primary" size="sm" />
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 60vh" class="scroll q-py-xs">
            <q-list>
              <q-item
                v-for="(item, index) of selected"
                :key="item.id"
                v-ripple
                :class="getClassItem(index) + ' q-py-xs'"
              >
                <div class="row w-100">
                  <div class="col-12 col-sm-4">
                    <span class="text-weight-medium"
                      >{{ item.senderDisplayName ? item.senderDisplayName : item.userName }} </span
                    ><br />
                    <span>Amount :</span>
                    <span class="text-weight-medium text-size-15"> ${{ item.amount }} </span>
                  </div>
                  <div class="col-12 col-sm-8">
                    <div class="center-row">
                      <p
                        class="bulk-address-area text-weight-bold text-blue-8 custom-link"
                        @click="copy(item.paymentSettings[0].address || '')"
                      >
                        {{ item.paymentSettings[0].address }}
                      </p>
                      <q-btn
                        v-if="value != ''"
                        class="q-ml-sm copy-btn"
                        round
                        dense
                        flat
                        @click="copy(item.paymentSettings[0].address || '')"
                      >
                        <q-icon size="xs" class="custom-icon" :name="'o_content_copy'" />
                        <q-tooltip>Copy address</q-tooltip>
                      </q-btn>
                    </div>
                    <span
                      class="text-weight-medium text-blue-8 text-size-15 custom-link"
                      @click="copy(item.expectedAmount || '')"
                      >{{ item.expectedAmount }} BTC</span
                    >
                    <q-btn
                      v-if="value != ''"
                      class="q-ml-sm copy-btn"
                      round
                      dense
                      flat
                      @click="copy(item.expectedAmount || '')"
                    >
                      <q-icon size="xs" class="custom-icon" :name="'o_content_copy'" />
                      <q-tooltip>Copy BTC Amount</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />
          <div class="row q-mt-sm q-px-md">
            <custom-input class="q-px-sm w-100" :label="'Enter transaction ID for bulk BTC payment'" v-model="txId" />
          </div>
          <q-card-actions class="q-pa-sm row justify-between">
            <p class="text-size-15 q-pt-none col-7 q-pb-xs q-pl-md">
              <span class="text-weight-medium">Total: ${{ totalBulkUSD }}</span> -
              <span class="text-blue-8 text-weight-medium">{{ totalBulkBTC }}&nbsp;BTC</span>
            </p>
            <div class="col-5 q-pb-xs q-pr-md" align="right">
              <q-btn
                label="Mark Paid"
                color="primary"
                class="col-5"
                @click="handlePaid"
                :disable="paying || selected.length <= 0"
                v-close-popup
              />
            </div>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import PaymentStatus from 'components/payment/paymentStatus'
import { date } from 'quasar'
import { MDateFormat } from 'src/consts/common'
import { mapGetters, mapActions } from 'vuex'
import { ref } from 'vue'
import role from 'src/consts/role'
import { PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'
import MTime from 'components/common/mTime'
import customPagination from '../common/custom_pagination.vue'
import customInput from '../common/custom_input.vue'
import { listenSocketEvent, removeListenSocketEvent } from 'src/helper/socket'

let memberStringOptions = []

export default {
  name: 'paymentList',
  setup() {
    const memberModel = ref(null)
    const memberFilterOptions = ref(memberStringOptions)
    return {
      memberModel,
      memberFilterOptions,
      memberStringOptions,

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
    }
  },
  data() {
    return {
      userSelection: [],
      isShowList: true,
      loading: false,
      rateLoading: false,
      pagination: {
        ...defaultPaging,
      },
      bulkPagination: {
        ...defaultPaging,
      },
      txId: '',
      paying: false,
      selected: [],
      isBulkPay: false,
      detailBulk: false,
      isExist: false,
      hidePaid: false,
      rows: [],
      rate: {
        rate: 0,
        converTime: '',
      },
      fixedColumns: [
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          sortable: true,
        },
        {
          name: 'amount',
          align: 'right',
          label: 'Amount (USD)',
          field: 'amount',
          sortable: true,
          format: (val) => {
            return val.toFixed(2)
          },
        },
      ],
      thumbStyle: {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75,
      },

      barStyle: {
        right: '2px',
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '9px',
        opacity: 0.2,
      },
      showBulkPay: false,
      totalBulkBTC: '',
      totalBulkUSD: '',
    }
  },
  created() {
    this.$api
      .get('/user/get-user-list', {})
      .then((res) => {
        this.userSelection = res
        memberStringOptions = []
        this.userSelection.forEach((userInfo) => {
          memberStringOptions.push({
            label: userInfo.userName,
            value: userInfo.id,
          })
        })
      })
      .catch((err) => {
        responseError(err)
      })
    listenSocketEvent('reloadList', this.onSocketMessage)
    if (this.type !== PAYMENT_OBJECT_REMINDER) {
      return
    }
    this.$api
      .get('/payment/bulk-pay-count')
      .then((count) => {
        this.showBulkPay = count > 1
      })
      .catch((err) => {
        responseError(err)
      })
  },
  beforeUnmount() {
    removeListenSocketEvent('reloadList', this.onSocketMessage)
  },
  components: {
    PaymentStatus,
    MTime,
    customPagination,
    customInput,
  },
  props: {
    type: String,
    label: String,
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    isUser() {
      return this.user.role === role.USER
    },
    columns() {
      let flexibleCol = [
        this.type === PAYMENT_OBJECT_REQUEST
          ? {
              name: 'receiverName',
              align: 'left',
              label: 'Recipient',
              sortable: true,
              field: (row) => {
                if (row.receiverDisplayName.length > 0) {
                  return row.receiverDisplayName + ' (' + row.receiverName + ')'
                } else {
                  return row.receiverName || row.externalEmail
                }
              },
            }
          : {
              name: 'senderName',
              required: true,
              label: 'Sender',
              align: 'left',
              sortable: true,
              field: (row) => {
                if (row.senderDisplayName.length > 0) {
                  return row.senderDisplayName + ' (' + row.senderName + ')'
                } else {
                  return row.senderName || row.externalEmail
                }
              },
              format: (val) => `${val}`,
            },
      ]

      let lastColum = [
        {
          name: 'startDate',
          align: 'center',
          label: 'Start Date',
          field: 'startDate',
          sortable: true,
          format: (val) => date.formatDate(val, MDateFormat),
        },
        {
          name: 'updatedAt',
          align: 'center',
          label: 'Last Edited',
          field: 'updatedAt',
          sortable: true,
          format: (val) => date.formatDate(val, MDateFormat),
        },
      ]

      if (this.type === PAYMENT_OBJECT_REMINDER) {
        lastColum.unshift({
          name: 'acceptedCoins',
          align: 'center',
          label: 'Accepted Coins',
          sortable: false,
          field: (row) => {
            return row.paymentSettings
              .map((el) => el.type)
              .join(', ')
              .toUpperCase()
          },
        })
      }
      return [...flexibleCol, ...this.fixedColumns, ...lastColum]
    },
  },
  methods: {
    ...mapActions({
      setGlobalUser: 'user/setGlobalUser',
    }),
    async getPayments(f) {
      this.loading = true
      this.$api
        .get('/payment/list', {
          params: f,
        })
        .then(({ payments, count }) => {
          if (this.type == 'approval' && count == 0) {
            this.isShowList = false
          }
          this.loading = false
          this.rows = payments || []
          this.pagination.rowsNumber = count
          //check view project column
          var hasProject = false
          var hasProjectColumnIndex = -1
          this.rows.forEach((payment) => {
            if (payment.projectId > 0) {
              hasProject = true
              return
            }
          })
          this.fixedColumns.forEach((fixedColumn, index) => {
            if (fixedColumn.name == 'projectName') {
              hasProjectColumnIndex = index
              return
            }
          })
          if (hasProject && hasProjectColumnIndex < 0) {
            var tempFixedColumn = new Array({
              name: 'projectName',
              align: 'center',
              label: 'Project',
              field: (row) => {
                if (row.showProjectOnInvoice) {
                  return row.projectName
                } else if (row.details && row.details.length > 0) {
                  var projectList = []
                  row.details.forEach((detail) => {
                    if (detail.projectId > 0 && !projectList.includes(detail.projectName)) {
                      projectList.push(detail.projectName)
                    }
                  })
                  if (projectList.length == 0) {
                    return ''
                  }
                  return projectList.join(', ')
                }
                return ''
              },
              sortable: true,
            })
            this.fixedColumns = tempFixedColumn.concat(this.fixedColumns)
          } else if (!hasProject && hasProjectColumnIndex >= 0) {
            this.fixedColumns.splice(hasProjectColumnIndex, 1)
          }
        })
        .catch((err) => {
          responseError(err)
          this.loading = false
        })
    },
    onSocketMessage(data) {
      // reload list
      this.getPayments({
        ...pathParamsToPaging(this.$route, this.pagination),
        requestType: this.type,
        hidePaid: this.hidePaid,
        userIds: this.memberModel?.value.map((user) => user.value).join(',') ?? '', // filter by user
      })
    },
    onBulkPay() {
      this.detailBulk = true
      this.getRate({ symbol: 'btc' })
    },
    handlePaid() {
      const txId = this.txId.trim()
      if (
        txId.length === 0 &&
        !confirm(
          'Are you sure you want to mark the payment as paid? providing the txId will make the requester confirm your payment faster'
        )
      ) {
        this.$refs.txId.$el.focus()
        return
      }
      const payments = this.selected.map((item) => ({
        paymentMethod: item.paymentMethod,
        paymentAddress: item.paymentAddress,
        convertTime: item.convertTime,
        id: item.id,
        rate: item.convertRate,
      }))
      const reqData = {
        paymentList: payments,
        txid: txId,
      }

      this.paying = true
      this.$api
        .post('/payment/bulk-paid-btc', reqData)
        .then((data) => {
          this.isBulkPay = false
          this.$q.notify({
            message: 'Payments made successfully',
            color: 'positive',
            icon: 'check',
          })
        })
        .catch((err) => {
          responseError(err)
        })
        .finally(() => {
          this.paying = false
        })
    },
    goToDetail(id) {
      const path = this.type === PAYMENT_OBJECT_REQUEST ? 'get-paid' : 'pay'
      this.$router.push({ path: `/${path}/${id}` })
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      this.$router.push({
        path: this.$route.fullPath,
        query,
      })
    },
    prepareToExit: function () {
      this.isExist = true
    },
    getRate(p) {
      this.rateLoading = true
      this.$api
        .get('/payment/rate', {
          params: p,
        })
        .then((data) => {
          //calc total of btc and usd for display on dialog
          let totalBTC = 0.0
          let totalUSD = 0.0
          this.selected.forEach((ele) => {
            const exAmount = ele.amount / data.rate
            ele.expectedAmount = exAmount.toFixed(8)
            ele.convertRate = data.rate
            ele.convertTime = data.convertTime
            totalBTC += exAmount
            totalUSD += ele.amount
          })
          this.totalBulkBTC = totalBTC.toFixed(8)
          this.totalBulkUSD = totalUSD.toFixed(2)
        })
        .catch((err) => {
          responseError(err)
        })
        .finally(() => {
          this.rateLoading = false
        })
    },
    async copy(text) {
      await navigator.clipboard.writeText(text)
      this.$q.notify({
        type: 'positive',
        message: 'Copied.',
        position: 'bottom',
      })
    },
    refreshExchangeRate() {
      this.getRate({ symbol: 'btc' })
    },
    getScrollHeight() {
      switch (this.selected.length) {
        case 1:
          return 200
        case 2:
          return 350
        case 3:
          return 500
        default:
          return 600
      }
    },
    getDialogWidth() {
      switch (this.selected.length) {
        case 1:
          return 750
        case 2:
          return 800
        case 3:
          return 850
        default:
          return 900
      }
    },
    hidePaidHandler() {
      this.hidePaid = !this.hidePaid
      this.$api
        .put('/user/hide-paid')
        .then((data) => {
          let newUser = { ...this.user }
          newUser.hidePaid = this.hidePaid
          this.setGlobalUser(newUser)
        })
        .catch((err) => {
          responseError(err)
        })
    },
    hidePaidFilter(value) {
      const filter = pathParamsToPaging({ query: {} }, this.pagination)
      this.getPayments({
        ...filter,
        requestType: this.type,
        hidePaid: value,
        userIds: this.memberModel?.value.map((user) => user.value).join(',') ?? '', // filter by user
      })
    },
    setIsBulkPay() {
      this.isBulkPay = !this.isBulkPay
    },
    getClassItem(index) {
      return index == this.selected.length - 1 ? '' : 'border-bottom'
    },
  },
  watch: {
    isBulkPay(newVal) {
      const filter = pathParamsToPaging({ query: {} }, this.pagination)
      if (newVal) {
        this.getPayments({
          ...filter,
          requestType: 'bulk_btc',
          userIds: this.memberModel?.value.map((user) => user.value).join(',') ?? '', // filter by user
        })
      } else {
        this.getPayments({
          ...filter,
          requestType: this.type,
          hidePaid: this.hidePaid,
          userIds: this.memberModel?.value.map((user) => user.value).join(',') ?? '', // filter by user
        })
      }
    },
    $route: {
      immediate: true,
      handler(to) {
        this.hidePaid = this.user.hidePaid
        if (this.isExist) {
          return
        }
        const filter = pathParamsToPaging(to, this.pagination)
        this.getPayments({
          ...filter,
          requestType: this.type,
          hidePaid: this.hidePaid,
          userIds: this.memberModel?.value.map((user) => user.value).join(',') ?? '', // filter by user
        })
      },
    },
    hidePaid(value) {
      this.hidePaidFilter(value)
    },
    memberModel: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.getPayments({
            ...pathParamsToPaging(this.$route, this.pagination),
            requestType: this.type,
            hidePaid: this.hidePaid,
            userIds: newVal.map((user) => user.value).join(','), // filter by user
          })
        }
      },
    },
  },
}
</script>

<style scoped></style>
