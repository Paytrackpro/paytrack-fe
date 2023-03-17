<template>
  <payment-list type="reminder" label="Make payment" />
</template>

<script>
import { PaymentList } from "components/payment";
export default {
  name: "payPage",
  components: {
    PaymentList,
  },
};
</script>

<style scoped></style>
