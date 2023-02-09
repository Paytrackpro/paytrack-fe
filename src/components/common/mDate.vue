<template>
  <span>{{dateView}}</span>
</template>

<script>
// mgmt Date component, will show all the date item in mgmt system
import { prettyDate } from "src/helper/date"
export default {
  name: "mDate",
  props: {
    date: String,
  },
  computed: {
    dateView() {
      const d = new Date(this.date)
      if (d.getFullYear() > 10) {
        return `${d.getFullYear()}-${prettyDate(d.getMonth() + 1)}-${prettyDate(d.getDate())}`
      }
      return ""
    }
  }
}
</script>

<style scoped>

</style>
