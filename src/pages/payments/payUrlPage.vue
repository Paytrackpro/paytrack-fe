<template>
  <div class="flex flex-center q-pa-md">
    <div v-if="loading" class="text-center">
      <q-card-section>
        <q-spinner-dots color="primary" size="40px" />
        <div class="q-mt-sm">Loading payment details...</div>
      </q-card-section>
    </div>
    <q-card v-else-if="isError" class="text-center q-pa-md">
      <q-card-section>
        <div class="text-h6">
          {{ errorMessage }}
        </div>
        <p>{{ errorDescription }}</p>
      </q-card-section>
    </q-card>
    <q-card v-else-if="!isNotfound" class="full-width" style="max-width: 80%">
      <q-card flat class="q-pb-md content-container">
        <paymentUrlDetail v-if="!editing" v-model="payment" />
      </q-card>
    </q-card>
    <q-card v-else class="text-center q-pa-md">
      <q-card-section>
        <div class="text-h6">Payment Not Found</div>
        <p>The payment request you are looking for does not exist.</p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { paymentUrlDetail } from 'components/paymentUrl'
import { PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
export default {
  name: 'payUrlPage',
  components: { paymentUrlDetail },
  data() {
    return {
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {},
      paymentType: PAYMENT_OBJECT_REQUEST,
      processing: false,
      unpaidTmpCount: 0,
      exitsPayment: false,
    }
  },
  created() {
    this.fetchData()
  },
  computed: {
    isError() {
      return this.isForbidden || this.isNotfound || this.isUnknownError
    },
    errorMessage() {
      if (this.isForbidden) return 'Access Denied'
      if (this.isNotfound) return 'Payment Not Found'
      return 'An Error Occurred'
    },
    errorDescription() {
      if (this.isForbidden) return 'You do not have permission to view this payment.'
      if (this.isNotfound) return 'The payment request you are looking for does not exist or you do not have access.'
      return 'There was an error loading the payment details. Please try again later.'
    },
  },
  methods: {
    fetchData() {
      this.loading = true
      this.isNotfound = true
      this.resetErrors()

      return this.$api
        .get(`/payment-url/pay/${this.$route.params.id}/${this.$route.params.code}`)
        .then((data) => {
          if (data && data.id !== 0 && data.amount > 0 && data.paymentCode) {
            this.payment = data
            this.exitsPayment = true
          } else {
            this.isNotfound = true
          }
        })
        .catch((err) => {
          switch (err.status) {
            case 403:
              this.isForbidden = true
              break
            case 404:
              this.isNotfound = true
              break
            default:
              this.isUnknownError = true
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    resetErrors() {
      this.isForbidden = false
      this.isNotfound = false
      this.isUnknownError = false
    },
  },
}
</script>

<style scoped></style>
