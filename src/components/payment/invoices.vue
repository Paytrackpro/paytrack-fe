<template>
  <q-markup-table flat bordered separator="cell">
    <table class="q-table">
      <thead>
        <tr>
          <th class="text-right" style="width: 100px">Hours</th>
          <th class="text-right" style="width: 120px">Costs(USD)</th>
          <th class="text-right">Description</th>
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
        <new-invoice
          v-if="!readonly"
          @save="newInvoice"
          :hourly-rate="hourlyRate"
        />
      </tbody>
    </table>
  </q-markup-table>
</template>

<script>
import NewInvoice from "components/payment/newInvoice";
import Invoice from "components/payment/invoice";
export default {
  name: "InvoicesList",
  components: { NewInvoice, Invoice },
  props: {
    modelValue: [Array],
    hourlyRate: [Number, String],
    readonly: Boolean,
  },
  emits: ["update:modelValue"],
  data() {
    return {
      invoices: [],
    };
  },
  methods: {
    newInvoice(newInv) {
      const invoices = [...this.invoices, newInv];
      this.$emit("update:modelValue", invoices);
    },
    deleteInvoice(key) {
      const invoices = [...this.invoices];
      invoices.splice(key, 1);
      this.$emit("update:modelValue", invoices);
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.invoices = newVal || [];
      },
    },
  },
};
</script>

<style scoped></style>
