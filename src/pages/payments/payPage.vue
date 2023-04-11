<template>
  <payment-list ref="paymentList" type="reminder" label="Make payment" />
</template>

<script>
import { PaymentList } from 'components/payment'
export default {
  name: 'payPage',
  components: {
    PaymentList,
  },
  beforeRouteLeave: function (to, from, next) {
    this.$refs.paymentList.prepareToExit()
    next()
  },
}
</script>

<style scoped></style>
