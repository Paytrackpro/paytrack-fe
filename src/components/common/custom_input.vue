<template>
  <div>
    <p v-if="label">
      <b :class="'text-weight-medium' + (notitleCase ? '' : ' title-case')">{{ label }} </b>
      <q-icon :name="labelIcon" v-if="labelIcon">
        <q-tooltip> {{ labelTooltip }} </q-tooltip>
      </q-icon>
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
      :placeholder="placeholder"
      :lazy-rules="lazyRules"
      :rules="rules"
      :step="step"
      :min="minValue"
    >
      <template v-slot:append>
        <slot name="append" />
      </template>
    </q-input>
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
    placeholder: String,
    lazyRules: Boolean,
    rules: Object,
    labelIcon: String,
    labelTooltip: String,
    step: String,
    notitleCase: Boolean,
    minValue: Number,
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
