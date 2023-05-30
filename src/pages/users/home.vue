<template>
  <div class="q-pa-lg">
    <div class="row q-mt-lg">
      <div class="col" align="right">
        <q-btn label="Create Request" icon="add" class="q-mr-sm" color="primary" to="/get-paid/create" />
      </div>
    </div>
    <div class="row q-mt-md">
      <div class="col-12 q-py-lg">
        <payment-list ref="paymentList" type="approval" label="Pending Approvals" />
      </div>
    </div>
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
