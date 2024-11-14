<template>
  <q-form @submit="submit">
    <q-card class="q-ma-md">
      <q-card-section>
        <h6 class="q-mb-md">Hour Rate & Payments</h6>
        <q-paragraph class="q-mb-md">
          Hourly rate is the rate you charge for each hour of work. It reflects the cost of services based on the time
          you work.
        </q-paragraph>
        <q-paragraph> Payment method is how you receive money for your fees. </q-paragraph>
      </q-card-section>
    </q-card>

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
      },
    },
  },
  methods: {
    ...mapActions({
      updateUser: 'user/updateUser',
    }),
    async submit() {
      this.loading = true
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
