<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6">Create payment request</div>
    </q-card-section>
    <q-separator inset />
    <payment-form
      :payment="payment"
      :user="user"
      @saved="saved"
      @cancel="$router.push({ name: 'payment.list' })"
    />
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
    let paymentSetting = {}
    if (user.paymentSetting && Array.isArray(user.paymentSetting)) {
      paymentSetting = user.paymentSetting[0]
      for (let s in user.paymentSetting) {
        if (s.isDefault) {
          paymentSetting = s
          break
        }
      }
    }
    console.log(user.paymentSettings )
    return {
      user: user,
      payment: {
        contactMethod: "internal",
        receiverId: user.id,
        creatorId: user.id,
        senderId: 0,
        hourlyRate: 0,
        senderEmail: "",
        txId: "",
        paymentMethod: paymentSetting.type || "",
        paymentAddress: paymentSetting.address || "",
        paymentSettings: user.paymentSettings || [],
        details: []
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
