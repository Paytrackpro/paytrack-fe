<template>
  <q-chip
    size="sm"
    square
    :class="chipClass"
    text-color="white"
    :color="statusInfo.statusColor"
    :icon="statusInfo.statusIcon"
  >
    {{ statusInfo.statusShow }}
  </q-chip>
</template>

<script>
import { mapGetters } from 'vuex'
import { STATUS_INFO } from 'src/consts/common'
export default {
  name: 'paymentStatus',
  props: {
    paymentModel: Object,
    text: String,
    isShowApprover: Boolean,
    isShowIcon: Boolean,
  },
  data() {
    return {
      payment: {},
      statusInfo: {},
    }
  },
  watch: {
    paymentModel: {
      immediate: true,
      handler(newPayment) {
        this.payment = { ...newPayment }
        this.statusInfo = this.getStatusInfo()
      },
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    chipClass: function () {
      let resultClass = 'text-size-13'
      if (this.isShowIcon) {
        return resultClass
      }
      return resultClass + ' without-icon'
    },
  },
  methods: {
    getStatusInfo() {
      if (this.text) {
        var tempStatus = {}
        tempStatus.statusShow = this.text
        tempStatus.statusColor = STATUS_INFO.unknown.statusColor
        tempStatus.statusIcon = STATUS_INFO.unknown.statusIcon
        return tempStatus
      }
      switch (this.payment.status) {
        case 'draft':
          return STATUS_INFO.draft
        case 'sent':
          if (this.user.id == this.payment.senderId) {
            return STATUS_INFO.sent
          }
          return this.getSentStatus()
        case 'confirmed':
          return this.getConfirmStatus()
        case 'paid':
          return STATUS_INFO.paid
        case 'rejected':
          return STATUS_INFO.rejected
        default:
          return STATUS_INFO.unknown
      }
    },
    getConfirmStatus() {
      if (this.user.id == this.payment.senderId) {
        return STATUS_INFO.sent
      } else {
        return STATUS_INFO.ready_bulk_pay_btc
      }
    },
    getSentStatus() {
      if (this.user.id == this.payment.senderId) {
        return STATUS_INFO.sent
      } else {
        let isAllApproved = true
        let isUserApproved = false
        if (this.payment.approvers !== null) {
          this.payment.approvers.forEach((el) => {
            if (el.approverId == this.user.id && el.isApproved) {
              isUserApproved = true
            }
            if (!el.isApproved) {
              isAllApproved = false
            }
          })
        }
        // the receiver
        if (this.user.id == this.payment.receiverId) {
          if (this.payment.approvers === null || this.payment.approvers.length == 0) {
            return STATUS_INFO.received
          }
          let userWaitApproval = this.payment.approvers
            .map((el) => {
              if (!el.isApproved) {
                return el.approverName
              }
            })
            .join(',')
          if (isAllApproved) {
            return STATUS_INFO.approved
          } else if (this.isShowApprover) {
            var approversStatus = {}
            approversStatus.statusShow = STATUS_INFO.waiting_approval.statusShow + ': ' + userWaitApproval
            approversStatus.statusColor = STATUS_INFO.waiting_approval.statusColor
            approversStatus.statusIcon = STATUS_INFO.waiting_approval.statusIcon
            return approversStatus
          } else {
            return STATUS_INFO.waiting_approval
          }
        } else {
          // for approver
          return isUserApproved ? STATUS_INFO.approved : STATUS_INFO.waiting_approval
        }
      }
    },
  },
}
</script>

<style scoped></style>
