<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-separator inset />
    <payment-form
      :payment="payment"
      :payment-type="paymentType"
      :user="user"
      @saved="saved"
      @cancel="cancel"
    />
  </q-card>
</template>

<script>
import { PaymentForm } from "components/payment"
import { mapGetters } from "vuex"
import { PAYMENT_OBJECT_REQUEST, PAYMENT_OBJECT_REMINDER } from "src/consts/paymentType"

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
    return {
      user: user,
      payment: {
        contactMethod: "internal",
        receiverId: 0,
        receiverName: "",
        creatorId: user.id,
        senderId: 0,
        senderName: "",
        hourlyRate: 0,
        senderEmail: "",
        txId: "",
        paymentMethod: paymentSetting.type || "",
        paymentAddress: paymentSetting.address || "",
        paymentSettings: user.paymentSettings || [],
        details: []
      },
      paymentType: PAYMENT_OBJECT_REQUEST
    }
  },
  computed: {
    ...mapGetters({
      role: "auth/getRole",
    }),
    title() {
      switch (this.paymentType) {
        case PAYMENT_OBJECT_REQUEST:
          return "Create invoices"
        case PAYMENT_OBJECT_REMINDER:
          return "Invite your recipients"
        default:
          return "Create payment"
      }
    }
  },
  methods: {
    cancel() {
      const path = this.paymentType === PAYMENT_OBJECT_REMINDER ? "pay" : "get-pay"
      this.$router.push({ path: `/${path}` })
    },
    saved(data) {
      const path = this.paymentType === PAYMENT_OBJECT_REMINDER ? "pay" : "get-pay"
      this.$router.push({ path: `/${path}/${data.id}`, params: { id: data.id } })
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        if (to.path === "/pay/create") {
          this.paymentType = PAYMENT_OBJECT_REMINDER
          this.payment.paymentSettings = []
          this.payment.senderId = this.user.id
          this.payment.senderName = this.user.userName
          this.payment.receiverId = 0
          this.payment.receiverName = ""
          return
        }
        if (to.path === "/get-pay/create") {
          this.paymentType = PAYMENT_OBJECT_REQUEST
          this.payment.paymentSettings = this.user.paymentSettings || []
          this.payment.senderId = 0
          this.payment.senderName = ""
          this.payment.receiverId = this.user.id
          this.payment.receiverName = this.user.userName
        }
      }
    }
  }
}
</script>

<style scoped></style>
