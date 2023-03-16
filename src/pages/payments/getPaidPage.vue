<template>
  <payment-list type="request" label="Get paid" />
</template>

<script>
import { PaymentList } from "components/payment";
export default {
  name: "getPaidPage",
  components: {
    PaymentList,
  },
};
</script>

<style scoped></style>
