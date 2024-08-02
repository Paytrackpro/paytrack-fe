<template>
  <q-form @submit="submit">
    <div class="row q-mb-md">
      <custom-input
        class="q-mt-md q-px-sm"
        :label="'Hour Rate (USD/h)'"
        notitleCase
        :type="'number'"
        v-model="hourlyLaborRate"
        :step="'any'"
        :rules="priceRules"
      />
    </div>
    <div class="row q-mb-xs q-col-gutter-md profile-padding">
      <div class="col-12">
        <PaymentSetting v-model="user.paymentSettings" />
      </div>
    </div>
    <div class="row q-mb-md">
      <div>
        <p class="text-weight-medium">Settings for Shop</p>
        <q-toggle v-model="useBtcpay" @update:model-value="onUseBtcPayUpdate" color="primary" label="Use BTCPay" />
        <input
          type="text"
          ref="preventToggleEnterEvt"
          v-bind:style="{
            maxWidth: '0px',
            maxHeight: '0px',
            opacity: 0,
            position: 'absolute',
          }"
        />
      </div>
    </div>
    <div class="row w-50 q-mb-md q-col-gutter-md profile-padding" v-if="useBtcpay">
      <div class="col-12 q-pt-none col-sm-6">
        <p class="q-mt-none q-mb-xs text-weight-medium col-4">BTCPay API Key</p>
        <q-input
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          v-model="btcKey"
          placeholder="API Key"
          :rules="[(val) => !!val || 'Required field']"
        />
      </div>
      <div class="col-12 q-pt-none col-sm-6">
        <p class="q-mt-none q-mb-xs text-weight-medium col-4">Store ID</p>
        <q-input
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          v-model="storeId"
          placeholder="Store ID"
          :rules="[(val) => !!val || 'Required field']"
        />
      </div>
    </div>
    <div>
      <q-btn label="Save" class="q-mr-xs btn-animated btn" :disable="loading" type="submit" color="primary" />
    </div>
  </q-form>
</template>

<script>
import { mapActions } from 'vuex'
import PaymentSetting from 'components/payment/paymentSetting'
import customInput from '../common/custom_input.vue'
export default {
  name: 'paymentMethods',
  components: {
    PaymentSetting,
    customInput,
  },
  props: {
    modelValue: Object,
  },
  data() {
    return {
      user: {},
      loading: false,
      priceRules: [
        (v) =>
          (v && v.toString().split('.').length < 2) ||
          (v && v.toString().split('.')[1].length <= 2) ||
          'No more than 2 digits after the decimal point',
      ],
      useBtcpay: false,
      storeId: '',
      btcKey: '',
    }
  },
  emits: ['update:modelValue'],
  computed: {
    hourlyLaborRate: {
      get() {
        return this.user.hourlyLaborRate
      },
      set(hourRate) {
        this.user.hourlyLaborRate = Number(hourRate)
      },
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.user = { ...newVal }
        this.useBtcpay = this.user.useBtcPay ? this.user.useBtcPay : false
        this.storeId = this.user.storeId ? this.user.storeId : ''
        this.btcKey = this.user.btcKey ? this.user.btcKey : ''
      },
    },
    storeId: {
      immediate: true,
      handler(newVal) {
        this.user.storeId = newVal
      },
    },
    btcKey: {
      immediate: true,
      handler(newVal) {
        this.user.btcKey = newVal
      },
    },
  },
  methods: {
    ...mapActions({
      updateUser: 'user/updateUser',
    }),
    onUseBtcPayUpdate(value) {
      this.user.useBtcPay = value
    },
    async submit() {
      this.loading = true
      if (!this.user.useBtcPay) {
        this.user.storeId = ''
        this.user.btcKey = ''
      }
      const newUser = await this.updateUser(this.user)
      if (newUser) {
        this.$emit('update:modelValue', newUser)
      }
      this.loading = false
    },
  },
}
</script>

<style scoped></style>
