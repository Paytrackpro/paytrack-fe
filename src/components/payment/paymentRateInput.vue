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
    <q-field v-if="!readonly" class="justify-start" stack-label borderless>
      <template v-slot:control>
        <span>${{ payment.convertRate.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') }} USD</span>
        <q-btn v-if="!loading" class="q-ml-sm" round dense flat @click="fetchRate">
          <q-tooltip>Refresh Exchange Rate</q-tooltip>
          <q-icon size="md" class="custom-icon" :name="'o_refresh'" />
        </q-btn>
        <q-spinner-oval v-else class="q-ml-sm" size="sm" />
      </template>
    </q-field>
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
      currentExchange: 'binance',
    }
  },
  props: {
    modelValue: Object,
    readonly: Boolean,
    loading: Boolean,
    exchange: String,
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
      const reqData = {
        id: this.modelValue.id,
        paymentMethod: this.modelValue.paymentMethod,
        paymentAddress: this.modelValue.paymentAddress,
        token: this.$route.params.token,
        exchange: this.currentExchange,
      }
      this.$emit('update:loading', true)
      this.$api
        .post('/payment/request-rate', reqData)
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
