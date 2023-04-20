<template>
  <q-field label="Exchange Rate" stack-label>
    <template v-slot:control>
      <div class="self-center full-width no-outline" tabindex="0">
        {{ payment.convertRate }}
      </div>
    </template>
    <template v-if="!readonly" v-slot:append>
      <q-btn v-if="!loading" round dense flat icon="currency_exchange" @click="fetchRate" />
      <q-spinner-oval v-else color="primary" size="1em" />
    </template>
  </q-field>
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
    }
  },
  props: {
    modelValue: Object,
    readonly: Boolean,
    loading: Boolean,
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
      }
      this.$emit('update:loading', true)
      this.$api
        .post('/payment/request-rate', reqData)
        .then((data) => {
          this.$emit('update:modelValue', data)
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
      },
    },
  },
}
</script>

<style scoped></style>
