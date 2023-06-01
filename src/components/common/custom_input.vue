<template>
  <div>
    <p>
      <b class="text-weight-medium">{{ label }} </b>
    </p>
    <q-input
      :class="customClass"
      v-model="inputModel"
      dense
      outlined
      stack-label
      auto
      :readonly="readonly"
      :style="customStyle"
      :rows="rows"
      hide-bottom-space
      :type="type"
      :error="error"
    />
  </div>
</template>

<script>
import { computed } from 'vue'
export default {
  name: 'customInput',
  props: {
    customClass: String,
    customStyle: String,
    modelValue: { type: [String, Number, Date], default: '' },
    readonly: Boolean,
    label: String,
    type: String,
    error: Boolean,
    rows: Number,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputModel = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        emit('update:modelValue', newValue)
      },
    })
    return { inputModel }
  },
}
</script>

<style scoped></style>
