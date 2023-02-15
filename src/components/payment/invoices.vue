<template>
  <q-markup-table flat bordered separator="cell">
    <table class="q-table">
      <thead>
      <tr>
        <th class="text-right" style="width: 100px">Hours</th>
        <th class="text-right" style="width: 120px">Costs(USD)</th>
        <th class="text-right" >Description</th>
        <th style="width: 100px">#</th>
      </tr>
      </thead>
      <tbody>
      <invoice v-for="(invoice, i) of value" v-model="value[i]" :key="i" :i="i" :hourly-rate="hourlyRate" @delete="deleteInvoice"/>
      <new-invoice @save="newInvoice" :hourly-rate="hourlyRate"/>
      </tbody>
    </table>
  </q-markup-table>
</template>

<script>
import NewInvoice from "components/payment/newInvoice";
import Invoice from "components/payment/invoice";
export default {
  name: "invoices",
  components: {NewInvoice, Invoice},
  props: {
    value: Array,
    hourlyRate: [Number, String]
  },
  emits: ['update:invoices', 'update:hourlyRate'],
  data() {
    return {
    }
  },
  methods: {
    newInvoice(newInv) {
      const invoices = [...this.value, newInv]
      this.$emit("input", invoices)
    },
    deleteInvoice(key) {
      const invoices = [...this.value]
      invoices.splice(key, 1)
      this.$emit("input", invoices)
    }
  },
}
</script>

<style scoped>

</style>
