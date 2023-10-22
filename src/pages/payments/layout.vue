<template>
  <div class="q-pa-lg">
    <router-view
      :approvalCount="approvalCount"
      :unpaidCount="unpaidCount"
      @updateUnpaidCount="updateUnpaidCount"
      :cartCount="cartCount"
      @updateCartCount="updateCartCount"
    />
  </div>
</template>

<script>
export default {
  name: 'pagePayment',
  props: {
    approvalCount: Number,
    unpaidCount: Number,
    cartCount: Number,
  },
  methods: {
    updateUnpaidCount(count) {
      this.$emit('updateUnpaidCount', count)
    },
    updateCartCount(count) {
      this.$emit('updateCartCount', count)
    },
  },
}
</script>

<style scoped></style>
