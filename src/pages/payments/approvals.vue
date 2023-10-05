<template>
  <div class="q-pa-lg">
    <payment-list ref="paymentList" type="approval" label="Pending Approvals" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { PaymentList } from 'components/payment'
export default {
  name: 'approvalList',
  components: {
    PaymentList,
  },
  props: {
    approvalCount: Number,
  },
  data() {
    return {
      tab: 'approval_list',
      loading: false,
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
  watch: {
    approvalCount(value) {
      if (value < 1) {
        this.$router.push({ path: `home` })
      }
    },
  },
}
</script>

<style></style>
