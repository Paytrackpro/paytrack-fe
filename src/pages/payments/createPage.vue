<template>
  <q-card flat class="content-container">
    <payment-form :payment="payment" :payment-type="paymentType" :user="user" @saved="saved" @cancel="cancel" />
  </q-card>
</template>

<script>
import { PaymentForm } from 'components/payment'
import { mapGetters } from 'vuex'
import { PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'

export default {
  name: 'createPayment',
  components: {
    PaymentForm,
  },
  props: {
    paymentType: String,
  },
  data() {
    return {
      payment: {
        contactMethod: 'internal',
        status: '',
        receiverId: 0,
        receiverName: '',
        senderId: 0,
        senderName: '',
        hourlyRate: 0,
        senderEmail: '',
        description: '',
        amount: 0,
        txId: '',
        paymentSettings: [],
        details: [],
        showDateOnInvoiceLine: false,
      },
    }
  },
  computed: {
    ...mapGetters({
      role: 'user/getRole',
      user: 'user/getUser',
    }),
  },
  methods: {
    cancel() {
      const path = this.paymentType === PAYMENT_OBJECT_REQUEST ? 'get-paid' : 'pay'
      this.$router.push({ path: `/${path}` })
    },
    saved(data) {
      const path = this.paymentType === PAYMENT_OBJECT_REMINDER ? 'pay' : 'get-paid'
      this.$router.push({
        path: `/${path}/${data.id}`,
        params: { id: data.id },
      })
    },
  },
  watch: {
    user: {
      immediate: true,
      handler(user) {
        this.payment.paymentSettings = user.paymentSettings || []
        this.payment.showDateOnInvoiceLine = user.showDateOnInvoiceLine
      },
    },
    paymentType: {
      immediate: true,
      handler(pType) {
        this.payment.paymentSettings = this.user.paymentSettings || []
        this.payment.senderId = this.user.id
        this.payment.senderName = this.user.userName
        this.payment.receiverId = 0
        this.payment.receiverName = ''
      },
    },
  },
}
</script>

<style scoped></style>
