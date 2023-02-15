<template>
  <tr>
    <td class="text-right">
      <q-input v-if="editing"
        label="Hours"
        v-model="invoice.hours"
        dense
        stack-label
        hide-bottom-space
        type="number"
        :error="submitted && invoice.hours < 0"
        @input="calculateCost"
      />
      <span v-else>{{value.hours || "_"}}</span>
    </td>
    <td class="text-right">
      <q-input v-if="editing"
        label="Cost"
        v-model="invoice.cost"
        :readonly="invoice.hours > 0"
        dense
        stack-label
        hide-bottom-space
        type="number"
        :error="submitted && invoice.cost <= 0"
      />
      <span v-else>{{value.cost}}</span>
    </td>
    <td class="text-right">
      <q-input v-if="editing"
        label="Description"
        v-model="invoice.description"
        dense
        stack-label
        hide-bottom-space
        rows="1"
        type="textarea"
        :error="submitted && !invoice.description"
      />
      <span v-else>{{value.description}}</span>
    </td>
    <td class="text-center">
      <span v-if="!editing" class="event-txt q-ma-xs text-secondary" @click="edit">Edit</span>
      <span v-if="!editing" class="event-txt q-ma-xs text-red" @click="$emit('delete', i)">Delete</span>
      <span v-if="editing" class="event-txt q-ma-xs text-secondary" @click="save">Save</span>
      <span v-if="editing" class="event-txt q-ma-xs" @click="cancel">Cancel</span>
    </td>
  </tr>
</template>

<script>
export default {
  name: "invoice",
  props: {
    i: Number,
    value: Object,
    hourlyRate: Number
  },
  data() {
    return {
      editing: false,
      submitted: false,
      invoice: {
        hours: "",
        cost: "",
        description: ""
      }
    }
  },
  methods: {
    edit: function () {
      this.invoice = { ...this.value }
      this.editing = true
    },
    save: function () {
      this.submitted = true
      if (!this.invoice.description || this.invoice.cost <= 0 || this.invoice.hours < 0) {
        return
      }
      this.$emit("input", {
        hours: Number(this.invoice.hours),
        cost: Number(this.invoice.cost),
        description: this.invoice.description
      })
      this.editing = false
    },
    cancel: function () {
      this.editing = false
    },
    calculateCost() {
      this.invoice.cost = Number(this.invoice.hours) * this.hourlyRate
    }
  },
  watch: {
    hourlyRate: {
      immediate: true,
      handler(newHR) {
        if (this.value.hours > 0) {
          this.$emit("input", {
            hours: Number(this.value.hours),
            cost: Number(this.value.hours) * newHR,
            description: this.value.description
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
