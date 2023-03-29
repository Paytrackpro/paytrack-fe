<template>
  <span>{{ statusView }}</span>
</template>

<script>
import {
  getStatusTagColor,
  getStatusText,
  PAYMENT_STATUS_APPROVED_TEXT,
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
        case 'rejected':
          return 'Rejected'
        case PAYMENT_STATUS_WAIT_APPROVAL_TEXT:
        case PAYMENT_STATUS_APPROVED_TEXT:
          return getStatusText(this.status)
        default:
          return 'Unknown'
      }
    },
  },
}
</script>

<style scoped></style>
