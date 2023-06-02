<template>
  <div class="row" v-if="!readonly">
    <div class="col">
      <q-btn
        icon="add"
        type="button"
        color="primary"
        label="Add Labor"
        class="btn-animated btn q-mr-sm btn-radius"
        @click="createInvoice('labor')"
      >
        <q-tooltip> Add Labor for Invoice </q-tooltip>
      </q-btn>
      <q-btn
        icon="add"
        type="button"
        color="secondary"
        label="Add Material"
        class="btn-animated btn q-mr-sm btn-radius"
        @click="createInvoice('material')"
      >
        <q-tooltip> Add Material for Invoice </q-tooltip>
      </q-btn>
    </div>
  </div>
  <q-markup-table flat class="q-mt-md" v-if="invoices.length > 0">
    <thead>
      <tr>
        <th class="text-left" style="width: 15%">Detail</th>
        <th class="text-left" style="width: 15%" v-if="showCost">Cost (USD)</th>
        <th class="text-left">Description</th>
        <th style="width: 15%" v-if="!readonly"></th>
      </tr>
    </thead>
    <tbody>
      <invoice
        v-for="(_, i) of invoices"
        v-model="invoices[i]"
        @update:modelValue="$emit('update:modelValue', invoices)"
        :key="i"
        :i="i"
        :hourly-rate="Number(hourlyRate)"
        :showCost="showCost"
        v-model:invoiceInput="invoiceInput"
        v-model:invoiceDialog="invoice_dialog"
        v-model:isEdit="isEdit"
        @delete="deleteInvoice"
        :readonly="readonly"
      />
    </tbody>
  </q-markup-table>
  <invoice-dialog
    :readonly="readonly"
    @update:mainModelValue="$emit('update:modelValue', invoices)"
    v-model:hourlyRate="hourlyRateUpdate"
    v-model:dialogModelValue="invoice_dialog"
    v-model:invoiceInput="invoiceInput"
    v-model:isEdit="isEdit"
    :type="createType"
    @save="newInvoice"
  />
</template>

<script>
import Invoice from 'components/payment/invoice'
import InvoiceDialog from 'components/payment/invoiceDialog.vue'
export default {
  name: 'InvoicesList',
  components: { Invoice, InvoiceDialog },
  props: {
    modelValue: [Array],
    hourlyRate: String,
    readonly: Boolean,
    showCost: Boolean,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      invoices: [],
      creating: false,
      invoice_dialog: false,
      createType: 'labor',
      hourlyRateUpdate: this.hourlyRate,
      isEdit: false,
      invoiceInput: {
        quantity: '',
        price: '',
        cost: 0,
        description: '',
      },
    }
  },
  methods: {
    getState() {
      return this.creating
    },
    newInvoice(newInv) {
      const invoices = [...this.invoices, newInv]
      this.$emit('update:modelValue', invoices)
      this.creating = false
    },
    deleteInvoice(key) {
      const invoices = [...this.invoices]
      invoices.splice(key, 1)
      this.$emit('update:modelValue', invoices)
    },
    createInvoice(type) {
      this.isEdit = false
      this.createType = type
      this.creating = true
      this.invoice_dialog = true
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.invoices = newVal || []
      },
    },
    hourlyRateUpdate: {
      immediate: true,
      handler(newVal) {
        this.$emit('update:hourlyRate', newVal)
      },
    },
  },
}
</script>

<style></style>
