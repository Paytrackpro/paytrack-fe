<template>
  <div class="row q-mt-lg">
    <div class="col text-bold text-grey-2" align="left">
      <q-checkbox label="Hide Paid" v-model="hidePaid" />
    </div>
    <div class="col" align="right">
      <q-btn label="Create Request" icon="add" class="q-mr-sm" color="primary" to="/get-paid/create" />
    </div>
  </div>
  <div class="row q-mt-md">
    <div class="col-12 q-py-lg">
      <payment-list ref="paymentList" type="request" class="title-case" label="Get paid" />
    </div>
  </div>
</template>

<script>
import { PaymentList } from 'components/payment'
export default {
  name: 'getPaidPage',
  components: {
    PaymentList,
  },
  data() {
    return {
      hidePaid: false,
    }
  },
  beforeRouteLeave: function (to, from, next) {
    this.$refs.paymentList.prepareToExit()
    next()
  },
}
</script>

<style scoped></style>
