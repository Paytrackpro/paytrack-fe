<template>
  <div v-if="isShowList">
    <q-table
      :title="label || 'Payments'"
      :loading="loading"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :selection="isBulkPay ? 'multiple' : 'none'"
      v-model:selected="selected"
      :hide-bottom="pagination.rowsNumber < 10"
      flat
      bordered
      @row-click="(_, row) => goToDetail(row.id)"
      @request="onRequest"
    >
      <template v-if="type === 'reminder'" v-slot:top>
        <div class="q-table__title">{{ label || 'Payments' }}</div>
        <q-space />
        <template v-if="showBulkPay">
          <q-checkbox label="Bulk Pay BTC" v-model="isBulkPay" />
          <q-btn @click="onBulkPay" v-show="isBulkPay && selected.length > 0" style="margin-left: 10px"
            >Bulk Pay BTC</q-btn
          >
        </template>
      </template>
      <template v-if="type === 'request'" v-slot:top-right>
        <q-btn color="white" text-color="black" label="Create" to="/get-paid/create" />
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <payment-status :payment="props.row" isShowApprover />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="detailBulk">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">Bulk Pay BTC</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            class="q-mb-xs"
            ref="txId"
            outlined
            dense
            v-model="txId"
            label="Enter transaction ID for bulk BTC payment"
          />
          <q-list bordered separator>
            <q-item v-for="item in selected" :key="item.id" clickable v-ripple>
              <q-item-section>
                <q-item-label lines="1">
                  <span class="text-weight-medium">Address: </span>
                  <span class="text-grey-8"> {{ item.paymentSettings[0].address }}</span>
                </q-item-label>
                <div class="row">
                  <q-item-label class="col q-my-sm" lines="1">Amount(USD): {{ item.amount }}</q-item-label>
                  <q-item-label class="col q-my-sm" lines="1">Amount(BTC): {{ item.expectedAmount }}</q-item-label>
                </div>
                <div class="row">
                  <q-item-label lines="5">Description: {{ item.description }}</q-item-label>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Paid" @click="handlePaid" :disable="paying" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import PaymentStatus from 'components/payment/paymentStatus'
import { date } from 'quasar'
import { MDateFormat } from 'src/consts/common'
import { mapGetters } from 'vuex'
import role from 'src/consts/role'
import { PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'

export default {
  name: 'paymentList',
  data() {
    return {
      isShowList: true,
      loading: false,
      pagination: {
        ...defaultPaging,
      },
      txId: '',
      paying: false,
      selected: [],
      isBulkPay: false,
      detailBulk: false,
      isExist: false,
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
          sortable: false,
        },
        {
          name: 'amount',
          align: 'center',
          label: 'Amount(USD)',
          field: 'amount',
          format: (val) => {
            return val.toFixed(2)
          },
        },
      ],
    }
  },
  components: {
    PaymentStatus,
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
    showBulkPay() {
      return this.type === PAYMENT_OBJECT_REMINDER
    },
    columns() {
      let flexibleCol = [
        this.type === PAYMENT_OBJECT_REQUEST
          ? {
              name: 'receiverName',
              align: 'center',
              label: 'Recipient',
              field: (row) => {
                if (row.receiverDisplayName.length > 0) {
                  return row.receiverDisplayName
                } else {
                  return row.receiverName || row.externalEmail
                }
              },
            }
          : {
              name: 'senderName',
              required: true,
              label: 'Sender',
              align: 'center',
              field: (row) => {
                if (row.senderDisplayName.length > 0) {
                  return row.senderDisplayName
                } else {
                  return row.senderName || row.externalEmail
                }
              },
              format: (val) => `${val}`,
            },
      ]

      let lastColum = [
        {
          name: 'createdAt',
          align: 'center',
          label: 'Created At',
          field: 'createdAt',
          sortable: true,
          format: (val) => date.formatDate(val, MDateFormat),
        },
      ]

      if (this.type === PAYMENT_OBJECT_REMINDER) {
        lastColum.unshift({
          name: 'acceptedCoins',
          align: 'center',
          label: 'Accepted Coins',
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
        })
        .catch((err) => {
          responseError(err)
          this.loading = false
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
            message: 'payments made successfully',
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
      this.$api
        .get('/payment/rate', {
          params: p,
        })
        .then((data) => {
          this.selected.forEach((ele) => {
            ele.expectedAmount = (ele.amount / data.rate).toFixed(8)
            ele.convertRate = data.rate
            ele.convertTime = data.convertTime
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    getStatus() {
      return 'ssssss'
    },
  },
  watch: {
    isBulkPay(newVal) {
      const filter = pathParamsToPaging({ query: {} }, this.pagination)
      if (newVal) {
        this.getPayments({
          ...filter,
          requestType: 'bulk_btc',
        })
      } else {
        this.getPayments({
          ...filter,
          requestType: this.type,
        })
      }
    },
    $route: {
      immediate: true,
      handler(to) {
        if (this.isExist) {
          return
        }
        const filter = pathParamsToPaging(to, this.pagination)
        this.getPayments({
          ...filter,
          requestType: this.type,
        })
      },
    },
  },
}
</script>

<style scoped></style>
