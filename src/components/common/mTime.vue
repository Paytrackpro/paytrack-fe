<template>
  <span>{{ timeView }}</span>
</template>

<script>
// Display All Time wit
import { date } from 'quasar'
export default {
  name: 'mTime',
  props: {
    time: String,
    format: String,
    dateTimeOnly: Boolean,
  },
  computed: {
    timeView() {
      const d = new Date(this.time)
      if (d.getTime() <= 0) {
        return
      }
      //if format is empty, display time as full timestamp UTC format
      if (this.time && !this.format) {
        return d.toISOString().replace(/T/, ' ').replace(/\..+/, '') + (this.dateTimeOnly ? '' : '')
      }
      return date.formatDate(this.time, this.format)
    },
  },
}
</script>

<style scoped></style>
