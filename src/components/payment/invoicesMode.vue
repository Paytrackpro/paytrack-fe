<template>
  <q-markup-table flat bordered separator="cell">
    <table class="q-table">
      <thead>
        <tr>
          <th class="text-right" style="width: 150px">Detail</th>
          <th class="text-right" style="width: 120px">Cost (USD)</th>
          <th class="text-left">Description</th>
          <th style="width: 100px" v-if="!readonly">#</th>
        </tr>
      </thead>
      <tbody>
        <invoice
          v-for="(_, i) of invoices"
          v-model="invoices[i]"
          @update:modelValue="$emit('update:modelValue', invoices)"
          :key="i"
          :i="i"
          :hourly-rate="hourlyRate"
          @delete="deleteInvoice"
          :readonly="readonly"
        />
        <template v-if="!readonly">
          <new-invoice
            v-if="creating"
            @save="newInvoice"
            :hourly-rate="hourlyRate"
            :type="createType"
            @cancel="creating = false"
          />
          <tr v-if="!creating">
            <td rowspan="4">
              <q-btn label="Add Labor" class="q-mr-sm" outline color="secondary" @click="createInvoice('labor')" />
              <q-btn label="Add Material" outline color="secondary" @click="createInvoice('material')" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </q-markup-table>
</template>

<script>
import NewInvoice from 'components/payment/newInvoice'
import Invoice from 'components/payment/invoice'
export default {
  name: 'InvoicesList',
  components: { NewInvoice, Invoice },
  props: {
    modelValue: [Array],
    hourlyRate: [Number, String],
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      invoices: [],
      creating: false,
      createType: 'labor',
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
      this.createType = type
      this.creating = true
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.invoices = newVal || []
      },
    },
  },
}
</script>

<style></style>
