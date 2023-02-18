<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6">Create payment request</div>
    </q-card-section>
    <q-separator inset />
    <payment-form :payment="payment" @saved="saved" @cancel="$router.push({ name: `${role}.payment.list` })" />
  </q-card>
</template>

<script>
import { PaymentForm } from "components/payment"
import { mapGetters } from "vuex"
export default {
  name: "createPayment",
  components: {
    PaymentForm,
  },
  data() {
    let user = localStorage.getItem("user")
    if (typeof user == "string" && user.length > 0) {
      user = JSON.parse(user)
    } else {
      user = {}
    }
    return {
      payment: {
        contactMethod: "internal",
        senderId: 0,
        amount: "",
        senderEmail: "",
        description: "",
        txId: "",
        paymentMethod: user.paymentType || "",
        paymentAddress: user.paymentAddress || "",
      },
    }
  },
  computed: {
    ...mapGetters({
      role: "auth/getRole",
    }),
  },
  methods: {
    saved(data) {
      this.$router.push({ name: `payment.detail`, params: { id: data.id } })
    },
  },
}
</script>

<style scoped></style>
