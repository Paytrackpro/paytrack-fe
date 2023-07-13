<template>
  <q-btn flat icon="undo" type="button" color="primary" class="btn-animated btn q-mb-md btn-radius" @click="back">
    <q-tooltip> Back to list page </q-tooltip>
  </q-btn>
  <q-card flat class="q-pb-md content-container">
    <payment-detail
      class="q-px-lg"
      v-if="!loading && !isError && !editing"
      v-model="payment"
      v-model:editing="editing"
      v-model:processing="processing"
      :approvalCount="approvalCount"
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
export default {
  name: 'detailPaymentPage',
  components: { PaymentForm, PaymentDetail },
  props: {
    approvalCount: Number,
  },
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
      processing: false,
    }
  },
  created() {
    this.token = this.$route.params.token || ''
    this.fetchData()
  },
  methods: {
    back() {
      //if is approvals list, back to prev page (dashboard)
      if (this.isApprover()) {
        if (this.approvalCount < 1) {
          this.$router.push({ path: `/get-paid` })
          return
        }
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
