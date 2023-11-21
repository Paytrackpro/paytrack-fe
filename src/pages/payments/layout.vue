<template>
  <div class="q-pa-lg">
    <router-view :approvalCount="approvalCount" :unpaidCount="unpaidCount" @updateUnpaidCount="updateUnpaidCount" />
  </div>
</template>

<script>
export default {
  name: 'pagePayment',
  props: {
    approvalCount: Number,
    unpaidCount: Number,
  },
  methods: {
    updateUnpaidCount(count) {
      this.$emit('updateUnpaidCount', count)
    },
  },
}
</script>

<style scoped></style>
