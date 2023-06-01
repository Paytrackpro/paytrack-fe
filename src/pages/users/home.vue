<template>
  <div class="q-pa-lg">
    <payment-list ref="paymentList" type="approval" label="Pending Approvals" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { PaymentList } from 'components/payment'
export default {
  name: 'userHome',
  components: {
    PaymentList,
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
}
</script>

<style></style>
