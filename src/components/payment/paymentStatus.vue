<template>
  <span>{{ statusView }}</span>
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
      user: "user/getUser",
    }),
    statusView() {
      const reminderSide = this.receiverId === this.user.id;
      switch (this.status) {
        case "draft":
          return "Draft";
        case "sent":
          return reminderSide ? "Received" : "Sent";
        case "confirmed":
          return reminderSide ? "Ready for Payment" : "Sent";
        case "paid":
          return "Paid";
        default:
          return "Unknown";
      }
    },
  },
};
</script>

<style scoped></style>
