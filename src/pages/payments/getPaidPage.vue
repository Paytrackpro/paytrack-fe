<template>
  <payment-list ref="paymentList" type="request" class="title-case" label="Get paid" />
</template>

<script>
import { PaymentList } from 'components/payment'
export default {
  name: 'getPaidPage',
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
