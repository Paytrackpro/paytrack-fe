<template>
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

<style>
.home-card {
  border-radius: 40px;
  padding: 40px;
}
.home-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}
.home-title-number {
  border: 1px solid #bcbcbc;
  border-radius: 50%;
  padding: 8px 12px;
  width: 100%;
  height: 100%;
}
</style>
