<template>
  <q-chip outline :color="statusColor" :text-color="statusColor">{{ statusView }}</q-chip>
</template>

<script>
import {
  getStatusTagColor,
  getStatusText,
  PAYMENT_STATUS_APPROVED_TEXT,
  PAYMENT_STATUS_REJECTED_TEXT,
  PAYMENT_STATUS_WAIT_APPROVAL,
  PAYMENT_STATUS_WAIT_APPROVAL_TEXT,
} from 'src/consts/paymentType'
import { mapGetters } from 'vuex'

export default {
  name: 'paymentStatus',
  props: {
    status: String,
    receiverId: Number,
    text: String,
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    statusView() {
      console.log(this.text, this.status)
      if (this.text) return this.text
      const reminderSide = this.receiverId === this.user.id
      switch (this.status) {
        case 'draft':
          return 'Draft'
        case 'sent':
          return reminderSide ? 'Received' : 'Sent'
        case 'confirmed':
          return reminderSide ? 'Ready for Payment' : 'Sent'
        case 'paid':
          return 'Paid'
        case PAYMENT_STATUS_WAIT_APPROVAL_TEXT:
        case PAYMENT_STATUS_APPROVED_TEXT:
        case PAYMENT_STATUS_REJECTED_TEXT:
          return getStatusText(this.status)
        default:
          return 'Unknown'
      }
    },

    statusColor() {
      return getStatusTagColor(this.status)
    },
  },
}
</script>

<style scoped></style>
