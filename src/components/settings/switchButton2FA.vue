<template>
  <div @keydown.enter.capture.stop>
    <q-toggle
      v-show="!!!qrImage"
      v-model="model"
      @update:model-value="onUpdated"
      color="green"
      label="Use two-factor authentication"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Switch2FAButton",
  props: {
    show: Boolean,
    onUpdatedValue: Function,
    modelValue: Boolean
  },
  data( ) {
    return {
      model: this.modelValue,
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
      qrImage: "user/getQrImage",
    }),
  },
  methods: {
    onUpdated(value) {
      this.$emit("onUpdateValue", value);
    },
  },
};
</script>
