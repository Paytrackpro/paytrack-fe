<template>
  <div>
    <p class="q-mb-xs" v-if="!readonly">
      <b class="text-weight-medium">Exchange Rate</b>
    </p>
    <div class="q-mb-xs row" v-if="readonly">
      <span class="paid-area-label">Rate:</span>
      <span class="paid-area-value"
        >${{ payment.convertRate.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') }} USD/{{
          (payment.paymentMethod || '').toUpperCase()
        }}</span
      >
    </div>
    <div class="row" v-if="!readonly">
      <span class="q-pt-xs">${{ payment.convertRate.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') }} USD</span>
      <q-btn v-if="!loading" class="q-ml-sm refresh-rate-btn" round dense flat @click="fetchRate">
        <q-tooltip>Refresh Exchange Rate</q-tooltip>
        <q-icon size="sm" class="custom-icon" :name="'o_refresh'" />
      </q-btn>
      <q-spinner-oval v-else class="q-ml-sm" size="sm" />
    </div>
  </div>
</template>

<script>
import { responseError } from 'src/helper/error'

export default {
  name: 'paymentRateInput',
  data() {
    return {
      payment: {
        convertRate: 0,
      },
      fetchedRate: false,
      currentExchange: '',
    }
  },
  props: {
    modelValue: Object,
    readonly: Boolean,
    loading: Boolean,
    exchange: String,
    rateType: String,
  },
  methods: {
    fetchRate() {
      if (this.modelValue.paymentMethod === 'none') {
        this.$q.notify({
          message: 'Please choose the payment request',
          type: 'negative',
        })
        return
      }
      if (!this.currentExchange) {
        return
      }
      const reqData = {
        id: this.modelValue.id,
        paymentMethod: this.modelValue.paymentMethod,
        paymentAddress: this.modelValue.paymentAddress,
        token: this.$route.params.token,
        exchange: this.currentExchange,
      }
      this.$emit('update:loading', true)
      const apiUrl = this.rateType === 'rateForPayUrl' ? '/payment-url/request-rate' : '/payment/request-rate'
      this.$api
        .post(apiUrl, reqData)
        .then((data) => {
          if (data.isPaid) {
            return
          }
          let newPayment = { ...this.modelValue }
          newPayment.convertRate = data.rate
          newPayment.convertTime = data.convertTime
          newPayment.expectedAmount = data.expectedAmount
          this.$emit('update:modelValue', newPayment)
          this.fetchedRate = true
        })
        .catch((err) => {
          responseError(err)
        })
        .finally(() => {
          this.$emit('update:loading', false)
        })
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newPayment) {
        this.payment = {
          ...newPayment,
        }
        if (!this.readonly && !this.fetchedRate) {
          this.fetchRate()
        }
      },
    },
    exchange: {
      immediate: true,
      handler(newExchange) {
        this.currentExchange = newExchange
        this.fetchRate()
      },
    },
  },
}
</script>

<style scoped></style>
