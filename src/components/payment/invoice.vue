<template>
  <tr>
    <td class="invoice-price-detail text-left" v-if="user.showDateOnInvoiceLine">
      {{ invoice.date.replaceAll('/', '-') }}
    </td>
    <td class="text-left">
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
          ? showCost
            ? `qty ${invoice.quantity} x $${invoice.price}`
            : `qty ${invoice.quantity}`
          : invoice.quantity
          ? `${invoice.quantity} hour(s)`
          : '_'
      }}</template>
    </td>
    <td class="text-left" v-if="showCost">
      <q-input
        v-if="editing"
        label="Cost"
        v-model="cost"
        readonly
        dense
        stack-label
        hide-bottom-space
        type="number"
        :error="submitted && invoice.cost <= 0"
      />
      <span v-else>$ {{ cost }}</span>
    </td>
    <td class="text-left">
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
      <q-btn v-if="!editing" size="sm" label="Edit" color="info" @click="edit" />
      <q-btn v-if="!editing" size="sm" class="q-ml-xs" label="Delete" color="accent" @click="confirm = true" />
      <span v-if="editing" class="event-txt q-ma-xs text-secondary" @click="save">Save</span>
      <span v-if="editing" class="event-txt q-ma-xs" @click="cancel">Cancel</span>
    </td>
  </tr>
  <q-dialog v-model="confirm" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="primary" text-color="white" />
        <span class="q-ml-sm">Are you sure to delete this row?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Delete" color="primary" v-close-popup @click="$emit('delete', i)" />
        <q-btn flat label="Cancel" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'invoiceRow',
  props: {
    i: Number,
    modelValue: Object,
    hourlyRate: Number,
    readonly: Boolean,
    showCost: Boolean,
    invoiceInput: Object,
    invoiceDialog: Boolean,
    isEdit: Boolean,
    createType: String,
    index: Number,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      editing: false,
      submitted: false,
      invoice: {
        quantity: '',
        price: '',
        cost: 0,
        description: '',
        date: '',
      },
      type: 'labor',
      confirm: false,
    }
  },
  methods: {
    edit: function () {
      this.invoice = { ...this.modelValue }
      this.$emit('update:invoiceInput', this.invoice)
      this.$emit('update:invoiceDialog', true)
      this.$emit('update:isEdit', true)
      this.$emit('update:createType', this.type)
      this.$emit('update:index', this.i)
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
        date: this.invoice.date,
      })
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
  computed: {
    cost: {
      get() {
        return this.invoice.cost.toFixed(2)
      },
      set(value) {
        this.invoice.cost = parseFloat(value)
      },
    },
    ...mapGetters({
      user: 'user/getUser',
    }),
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
            date: this.modelValue.date,
          })
        }
      },
    },
    modelValue: {
      immediate: true,
      handler(invoice) {
        this.invoice = { ...invoice }
        this.type = invoice.price > 0 ? 'material' : 'labor'
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
