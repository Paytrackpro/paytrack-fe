<template>
  <div class="q-pa-lg" v-if="!user.showMonthlyReport">
    <payment-list ref="paymentList" type="approval" label="Pending Approvals" />
  </div>
  <q-card v-else class="q-pa-md q-ma-lg content-container">
    <q-card-section class="q-py-none">
      <q-tabs align="left" v-model="tab" inline-label active-class="tab-active">
        <q-tab label="Approval List" icon="badge" name="approval_list" no-caps class="tab-item" />
        <q-tab label="Report" icon="credit_card" name="report" no-caps class="tab-item" />
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
        <q-tab-panel class="q-pa-none" name="approval_list">
          <payment-list ref="paymentList" type="approval" label="Pending Approvals" />
        </q-tab-panel>
        <q-tab-panel class="q-pa-none" name="report">
          <p class="text-h6">Summary</p>
          <div class="row q-mb-md q-col-gutter-md">
            <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
              <p class="text-bold">Select Month</p>
              <q-select
                v-model="selectedMonth"
                :options="monthChoose"
                outlined
                dense
                style="max-width: 250px"
                lazy-rules
                stack-label
                emit-value
                map-options
                borderless
              />
            </div>
            <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
              <p class="text-bold">Payees filter</p>
              <q-input
                outlined
                dense
                lazy-rules
                stack-label
                @blur="checkValidPayees"
                :error="payeesError"
                :error-message="payees.error"
                hide-bottom-space
                v-model="payees.value"
                placeholder="Separate with comma(,)"
              >
                <template v-slot:append>
                  <q-icon v-if="payees.value !== ''" name="close" @click="payees.value = ''" class="cursor-pointer" />
                </template>
              </q-input>
              <q-chip
                v-for="(item, index) in payees.usernames"
                :key="item"
                :clickable="false"
                square
                dense
                text-color="white"
                :color="index % 2 ? 'positive' : 'warning'"
                icon="person"
              >
                {{ item }}
              </q-chip>
            </div>
          </div>
          <div class="row q-mb-md q-col-gutter-md">
            <p class="text-bold">Start From: 01/{{ selectedMonth }}/2023</p>
          </div>
          <div class="row q-mb-md q-col-gutter-md">
            <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
              <p>
                <span class="text-bold">Total Requests Received:</span> {{ paymentSummary.requestReceived }} requests
              </p>
              <p><span class="text-bold">Total Requests Sent: </span>{{ paymentSummary.requestSent }} requests</p>
              <p><span class="text-bold">Total Requests Paid: </span>{{ paymentSummary.requestPaid }} requests</p>
            </div>
            <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
              <p><span class="text-bold">Total Paid: </span>${{ paymentSummary.totalPaid }}</p>
              <p><span class="text-bold">Total Received: </span>${{ paymentSummary.totalReceived }}</p>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { ref } from 'vue'
import { date } from 'quasar'
import { PaymentList } from 'components/payment'
import customField from 'src/components/common/custom_field.vue'
import {
  DESTINATION_CHECK_NONE,
  DESTINATION_CHECK_DONE,
  DESTINATION_CHECK_CHECKING,
  DESTINATION_CHECK_FAIL,
} from 'src/consts/common'
export default {
  name: 'userHome',
  components: {
    PaymentList,
  },
  data() {
    return {
      tab: 'approval_list',
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
    }
  },
  methods: {
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
  },
}
</script>

<style></style>
