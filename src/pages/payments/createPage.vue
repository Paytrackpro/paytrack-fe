<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6">Create payment request</div>
    </q-card-section>
    <q-separator inset />
    <payment-form
      :payment="payment"
      @saved="saved"
      @cancel="$router.push({ name: 'payment.list' })"
    />
  </q-card>
</template>

<script>
import {PaymentForm} from "components/payment";
export default {
  name: "createPayment",
  components: {
    PaymentForm
  },
  data() {
    return {
      payment: {
        contactMethod: "internal",
        senderId: 0,
        amount: "",
        senderEmail: "",
        description: "",
        txId: "",
        paymentMethod: "",
        paymentAddress: ""
      },
    }
  },
  methods: {
    saved(data) {
      this.$router.push({ name: "payment.detail", params: {id: data.payment.id} })
    }
  }
}
</script>

<style scoped>

</style>
