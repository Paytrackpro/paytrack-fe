<template>
  <div>
    <q-toggle
      v-show="!!!qrImage"
      v-model="model"
      @update:model-value="onUpdated"
      color="green"
      label="Use two-factor authentication"
    />
    <input
      type="text"
      ref="preventToggleEnterEvt"
      v-bind:style="{
        maxWidth: '0px',
        maxHeight: '0px',
        opacity: 0,
        position: 'absolute',
      }"
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
    modelValue: Boolean,
  },
  data() {
    return {
      model: false,
    };
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
      qrImage: "user/getQrImage",
    }),
  },
  methods: {
    onUpdated(value) {
      this.$refs["preventToggleEnterEvt"].focus();
      this.$emit("onUpdateValue", value);
      this.$emit("update:modelValue", value);
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.model = newVal;
      },
    },
  },
};
</script>
