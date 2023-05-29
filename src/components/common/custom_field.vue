<template>
  <div>
    <p class="q-mb-xs" v-if="label">
      <b class="text-weight-medium">{{ label }} </b>
    </p>
    <q-field :class="customClass" :style="customStyle" stack-label borderless>
      <template v-slot:control>
        {{ value }}
      </template>
    </q-field>
  </div>
</template>

<script>
import { computed } from 'vue'
export default {
  name: 'customField',
  props: {
    customClass: String,
    customStyle: String,
    value: { type: [String, Number, Date], default: '' },
    label: String,
    customContent: String,
  },
}
</script>

<style scoped></style>
