<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-separator inset />
    <payment-form :payment="payment" :payment-type="paymentType" :user="user" @saved="saved" @cancel="cancel" />
  </q-card>
</template>

<script>
import { PaymentForm } from 'components/payment'
import { mapGetters } from 'vuex'
import { PAYMENT_OBJECT_REQUEST, PAYMENT_OBJECT_REMINDER } from 'src/consts/paymentType'

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
        creatorId: 0,
        senderId: 0,
        senderName: '',
        hourlyRate: 0,
        senderEmail: '',
        txId: '',
        paymentSettings: [],
        details: [],
      },
    }
  },
  computed: {
    ...mapGetters({
      role: 'user/getRole',
      user: 'user/getUser',
    }),
    title() {
      return 'Create payment request'
    },
  },
  methods: {
    cancel() {
      this.$router.push({ path: `/` })
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
        this.payment.creatorId = user.id || 0
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
