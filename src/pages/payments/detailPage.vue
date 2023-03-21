<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6">
        Payment request
        <template v-if="payment.status">
          <payment-status :status="payment.status" :receiver-id="payment.receiverId" />
        </template>
      </div>
    </q-card-section>
    <q-separator inset />
    <payment-detail
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
import PaymentStatus from 'components/payment/paymentStatus'
import { mapGetters } from 'vuex'
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

<style scoped></style>
