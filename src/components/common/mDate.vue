<template>
  <span>{{ dateView }}</span>
</template>

<script>
// mgmt Date component, will show all the date item in mgmt system
import { MDateFormat } from "src/consts/common";
import { date } from "quasar";
export default {
  name: "mDate",
  props: {
    date: String,
  },
  computed: {
    dateView() {
      const d = new Date(this.date);
      if (d.getTime() <= 0) {
        return;
      }
      return date.formatDate(this.date, MDateFormat);
    },
  },
};
</script>

<style scoped></style>
