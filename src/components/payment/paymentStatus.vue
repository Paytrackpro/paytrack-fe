<template>
<span>{{statusView}}</span>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "paymentStatus",
  props: {
    status: String,
    receiverId: Number,
  },
  computed: {
    ...mapGetters({
      user: "user/getUser"
    }),
    statusView() {
      const requestSide = this.receiverId === this.user.id
      switch (this.status) {
        case "draft":
          return "Draft"
        case "sent":
          return requestSide ? "Sent" : "Received"
        case "confirmed":
          return requestSide ? "Sent" : "Ready for Payment"
        case "paid":
          return "Paid"
        default:
          return "Unknown"
      }
    }
  }
}
</script>

<style scoped>

</style>
