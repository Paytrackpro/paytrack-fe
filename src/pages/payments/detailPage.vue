<template>
  <q-btn flat icon="undo" type="button" color="primary" class="btn-animated btn q-mb-md btn-radius" @click="back">
    <q-tooltip> Back to list page </q-tooltip>
  </q-btn>
  <q-card flat class="q-pa-md content-container">
    <q-card-section>
      <div class="row">
        <div class="text-h6 title-case">Payment request</div>
        <payment-status :paymentModel="payment" class="q-ml-md" :isShowIcon="true" />
      </div>
      <p class="text-red" v-if="payment.status === 'rejected'">
        <q-icon name="info" color="red" />
        <b>Rejected Reason:</b> {{ payment.rejectionReason }}
      </p>
    </q-card-section>
    <payment-detail
      class="q-px-lg"
      v-show="!loading && !isError && !editing"
      v-model="payment"
      v-model:editing="editing"
      :payment-type="paymentType"
      :token="token"
      :user="user"
      @update:modelValue="saved"
    />
    <payment-form
      v-if="editing"
      :payment="payment"
      :isEdit="true"
      :payment-type="paymentType"
      :user="user"
      :token="token"
      @saved="saved"
      @cancel="editing = false"
    />
    <q-card-section v-show="isError">
      <div class="text-h6">{{ errorText }}</div>
    </q-card-section>

    <q-inner-loading :showing="loading" label="Please wait..." label-class="text-teal" label-style="font-size: 1.1em" />
  </q-card>
</template>

<script>
import { PaymentForm, PaymentDetail } from 'components/payment'
import { PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
import { mapGetters } from 'vuex'
import PaymentStatus from 'components/payment/paymentStatus'
export default {
  name: 'detailPaymentPage',
  components: { PaymentForm, PaymentDetail, PaymentStatus },
  data() {
    return {
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {},
      token: '',
      paymentType: PAYMENT_OBJECT_REQUEST,
    }
  },
  created() {
    this.token = this.$route.params.token || ''
    this.fetchData()
  },
  methods: {
    back() {
      if (this.isApprover()) {
        this.$router.back()
        return
      }
      const path = this.paymentType === PAYMENT_OBJECT_REQUEST ? 'get-paid' : 'pay'
      this.$router.push({ path: `/${path}` })
    },
    isApprover() {
      return this.payment.receiverId != this.user.id && this.payment.senderId != this.user.id
    },
    fetchData() {
      const token = this.$route.params.token || ''
      this.loading = true
      this.$api
        .get(`/payment/${this.$route.params.id}?token=${token}`)
        .then((data) => {
          this.loading = false
          this.payment = data
        })
        .catch((err) => {
          this.loading = false
          switch (err.status) {
            case 403:
              this.isForbidden = true
              return
            case 404:
              this.isNotfound = true
              return
          }
          this.isUnknownError = true
        })
    },
    saved(data) {
      this.payment = data
      this.editing = false
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    isError: function () {
      return this.isForbidden || this.isNotfound || this.isUnknownError
    },
    errorText: function () {
      if (this.isForbidden) {
        return 'You do not have access right to this asset'
      }
      if (this.isNotfound) {
        return 'Payment not found'
      }
      return 'Unknown error. Please contact the admin'
    },
  },
  watch: {
    payment: {
      immediate: true,
      handler(to) {
        if (this.user.id === to.receiverId) {
          this.paymentType = PAYMENT_OBJECT_REMINDER
        } else {
          this.paymentType = PAYMENT_OBJECT_REQUEST
        }
      },
    },
  },
}
</script>

<style>
.rejection-reason {
  white-space: pre-line;
}
</style>
