<template>
  <span>{{ statusView }}</span>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'paymentStatus',
  props: {
    payment: Object,
    text: String,
    isShowApprover: Boolean,
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    statusView() {
      if (this.text) return this.text
      switch (this.payment.status) {
        case 'draft':
          return 'Draft'
        case 'sent':
          if (this.user.id == this.payment.senderId) {
            return 'Sent'
          }
          return this.getSentStatus()
        case 'confirmed':
          return this.getConfirmStatus()
        case 'paid':
          return 'Paid'
        case 'rejected':
          return 'Rejected'
        default:
          return 'Unknown'
      }
    },
  },
  methods: {
    getConfirmStatus() {
      if (this.user.id == this.payment.senderId) {
        return 'Sent'
      } else {
        return 'Ready for Payment'
      }
    },
    getSentStatus() {
      if (this.user.id == this.payment.senderId) {
        return 'Sent'
      } else {
        let isAllApproved = true
        let isUserApproved = false
        this.payment.approvers.forEach((el) => {
          if (el.approverId == this.user.id && el.isApproved) {
            isUserApproved = true
          }
          if (!el.isApproved) {
            isAllApproved = false
          }
        })
        // the receiver
        if (this.user.id == this.payment.receiverId) {
          if (this.payment.approvers.length == 0) {
            return 'Received'
          }
          let userWaitApproval = this.payment.approvers
            .map((el) => {
              if (!el.isApproved) {
                return el.approverName
              }
            })
            .join(',')
          return isAllApproved
            ? 'Approved'
            : this.isShowApprover
            ? 'Waiting for Approval: ' + userWaitApproval
            : 'Waiting for Approval'
        } else {
          // for approver
          return isUserApproved ? 'Approved' : 'Waiting for Approval'
        }
      }
    },
  },
}
</script>

<style scoped></style>
