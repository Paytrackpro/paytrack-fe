<template>
  <div>
    <p class="q-mb-xs">
      <b class="text-weight-medium">Exchange Rate</b>
    </p>
    <q-field class="justify-start" stack-label borderless>
      <template v-slot:control>
        <span>{{ payment.convertRate }}</span>
        <q-btn v-if="!readonly && !loading" class="q-ml-sm" round dense flat @click="fetchRate">
          <q-tooltip>Refresh Exchange Rate</q-tooltip>
          <q-icon size="md" class="custom-icon" :name="'o_refresh'" />
        </q-btn>
        <q-spinner-oval v-else-if="!readonly && loading" class="q-ml-sm" size="sm" />
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
        if (!this.readonly) {
          this.fetchRate()
        }
      },
    },
  },
}
</script>

<style scoped></style>
