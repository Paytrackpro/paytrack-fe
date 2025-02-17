<template>
  <div class="row items-center tag-container">
    <q-chip square :class="'sm-chip ' + chipClass" text-color="white" color="info" icon="link"> PaymentUrl </q-chip>
    <q-btn class="copy-btn" round dense flat @click="copy">
      <q-icon size="xs" class="custom-icon" name="o_content_copy" />
      <q-tooltip>Copy payment url</q-tooltip>
    </q-btn>
  </div>
</template>

<script>
export default {
  name: 'PaymentUrlTag',
  props: {
    isShowIcon: {
      type: Boolean,
      default: true,
    },
    paymentUrl: {
      type: [String, Number],
      required: true,
    },
  },
  methods: {
    async copy() {
      const paymentUrl = `${window.location.origin}/payment/${this.paymentId}`
      await navigator.clipboard.writeText(paymentUrl)
      this.$q.notify({
        type: 'positive',
        message: 'Copied payment link.',
        position: 'bottom',
      })
    },
  },
  computed: {
    chipClass() {
      let resultClass = 'text-size-13'
      if (this.isShowIcon) {
        return resultClass
      }
      return resultClass + ' without-icon'
    },
  },
}
</script>

<style scoped>
.sm-chip {
  font-size: 13px;
}
.without-icon {
  padding: 0 8px;
}
.tag-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.copy-btn {
  opacity: 0;
  transition: opacity 0.3s ease;
  position: absolute;
  left: 100%; /* Thay đổi từ right sang left */
  margin-left: 4px; /* Thêm margin để điều chỉnh khoảng cách */
  min-width: 24px;
  min-height: 24px;
  padding: 4px;
}
.tag-container:hover .copy-btn {
  opacity: 1;
}
</style>
