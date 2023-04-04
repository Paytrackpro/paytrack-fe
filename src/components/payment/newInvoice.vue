<template>
  <tr>
    <td class="text-right">
      <div class="row items-start">
        <q-input
          class="col"
          :label="type === 'labor' ? 'Hours' : 'Quantity'"
          v-model="invoice.quantity"
          dense
          stack-label
          hide-bottom-space
          type="number"
          :error="submitted && invoice.hours < 0"
          @update:modelValue="calculateCost"
        />
        <q-input
          v-if="type === 'material'"
          class="col"
          label="Price"
          v-model="invoice.price"
          dense
          stack-label
          hide-bottom-space
          type="number"
          :error="submitted && invoice.hours < 0"
          @update:modelValue="calculateCost"
        />
      </div>
    </td>
    <td class="text-right">
      <q-input
        style="max-width: 200px"
        label="Cost"
        v-model="invoice.cost"
        :readonly="type === 'material' || invoice.quantity !== ''"
        dense
        stack-label
        hide-bottom-space
        type="number"
        :error="submitted && invoice.cost <= 0"
      />
    </td>
    <td class="text-right">
      <q-input
        label="Description"
        v-model="invoice.description"
        dense
        stack-label
        hide-bottom-space
        rows="1"
        type="textarea"
        autogrow
        :error="submitted && !invoice.description"
      />
    </td>
    <td class="text-center">
      <span class="event-txt q-ma-xs text-secondary" @click="save">Save</span>
      <span class="event-txt q-ma-xs" @click="cancel">Cancel</span>
    </td>
  </tr>
</template>

<script>
export default {
  name: 'newInvoice',
  props: {
    hourlyRate: Number,
    type: String,
  },
  data() {
    return {
      submitted: false,
      invoice: {
        quantity: '',
        price: '',
        cost: '',
        description: '',
      },
    }
  },
  methods: {
    save() {
      this.submitted = true
      if (!this.invoice.description || this.invoice.cost <= 0) {
        return
      }
      this.$emit('save', {
        quantity: Number(this.invoice.quantity),
        price: Number(this.invoice.price),
        cost: Number(this.invoice.cost),
        description: this.invoice.description,
      })
      this.cancel()
    },
    cancel() {
      this.submitted = false
      this.invoice = {
        quantity: '',
        price: '',
        cost: '',
        description: '',
      }
      this.$emit('cancel')
    },
    calculateCost() {
      let price = Number(this.invoice.price)
      if (this.type === 'labor') {
        price = this.hourlyRate
      }
      this.invoice.cost = Number(this.invoice.quantity) * price
    },
  },
  watch: {
    hourlyRate: {
      immediate: true,
      handler(newHR) {
        this.calculateCost()
      },
    },
  },
}
</script>

<style scoped></style>
