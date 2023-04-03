<template>
  <tr>
    <td class="invoice-price-detail text-right">
      <div v-if="editing" class="row items-start">
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
      <template v-else>{{
        type === 'material'
          ? `$${modelValue.price}/${modelValue.quantity}(qty)`
          : modelValue.quantity
          ? `${modelValue.quantity} hour(s)`
          : '_'
      }}</template>
    </td>
    <td class="text-right">
      <q-input
        v-if="editing"
        label="Cost"
        v-model="invoice.cost"
        :readonly="invoice.hours > 0"
        dense
        stack-label
        hide-bottom-space
        type="number"
        :error="submitted && invoice.cost <= 0"
      />
      <span v-else>{{ modelValue.cost }}</span>
    </td>
    <td class="text-right">
      <q-input
        v-if="editing"
        label="Description"
        v-model="invoice.description"
        autogrow
        dense
        stack-label
        hide-bottom-space
        rows="1"
        type="textarea"
        :error="submitted && !invoice.description"
      />
      <span class="content-wrap" v-else>{{ modelValue.description }}</span>
    </td>
    <td class="text-center" v-if="!readonly">
      <span v-if="!editing" class="event-txt q-ma-xs text-secondary" @click="edit">Edit</span>
      <span v-if="!editing" class="event-txt q-ma-xs text-red" @click="$emit('delete', i)">Delete</span>
      <span v-if="editing" class="event-txt q-ma-xs text-secondary" @click="save">Save</span>
      <span v-if="editing" class="event-txt q-ma-xs" @click="cancel">Cancel</span>
    </td>
  </tr>
</template>

<script>
export default {
  name: 'invoiceRow',
  props: {
    i: Number,
    modelValue: Object,
    hourlyRate: Number,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      editing: false,
      submitted: false,
      invoice: {
        quantity: '',
        price: '',
        cost: '',
        description: '',
      },
      type: 'labor',
    }
  },
  methods: {
    edit: function () {
      this.invoice = { ...this.modelValue }
      this.editing = true
    },
    save: function () {
      this.submitted = true
      if (!this.invoice.description || this.invoice.cost <= 0) {
        return
      }
      this.$emit('update:modelValue', {
        quantity: Number(this.invoice.quantity),
        price: Number(this.invoice.price),
        cost: Number(this.invoice.cost),
        description: this.invoice.description,
      })
      this.editing = false
    },
    cancel: function () {
      this.editing = false
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
        if (this.modelValue.quantity > 0 && this.modelValue.price === 0) {
          this.$emit('update:modelValue', {
            price: 0,
            quantity: Number(this.modelValue.quantity),
            cost: Number(this.modelValue.quantity) * Number(newHR),
            description: this.modelValue.description,
          })
        }
      },
    },
    modelValue: {
      immediate: true,
      handler(newHR) {
        this.type = newHR.price > 0 ? 'material' : 'labor'
      },
    },
  },
}
</script>

<style scoped>
.invoice-price-detail {
  max-height: 150px;
}
</style>
