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
        <th class="text-left" style="width: 25%">Description</th>
        <th class="text-left" style="width: 15%" v-if="user.showDateOnInvoiceLine">Date</th>
        <th class="text-left" style="width: 15%">Project</th>
        <th class="text-left" style="width: 15%">Detail</th>
        <th class="text-left" style="width: 15%" v-if="showCost">Cost (USD)</th>
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
        v-model:createType="createType"
        v-model:index="index"
        @delete="deleteInvoice"
        :readonly="readonly"
      />
    </tbody>
    <tfoot class="card-footer">
      <tr>
        <td>
          <p class="q-pb-sm q-pt-md text-size-13 text-weight-medium">Total</p>
        </td>
        <td v-if="user.showDateOnInvoiceLine"></td>
        <td></td>
        <td class="text-weight-medium text-size-13">
          <span v-if="isDisplayHours()">{{ getTotalHours().toFixed(2) }}&nbsp;hour(s)</span>
        </td>
        <td v-if="showCost" class="text-weight-medium text-size-13">
          $&nbsp;{{ readonly ? amount.toFixed(2) : amount }}
        </td>
        <td v-if="!readonly"></td>
      </tr>
    </tfoot>
  </q-markup-table>
  <invoice-dialog
    :readonly="readonly"
    v-model:hourlyRate="hourlyRateUpdate"
    v-model:dialogModelValue="invoice_dialog"
    v-model:invoiceInput="invoiceInput"
    v-model:isEdit="isEdit"
    :type="createType"
    @updateInvoice="updateInvoice"
    @save="newInvoice"
  />
</template>

<script>
import Invoice from 'components/payment/invoice'
import InvoiceDialog from 'components/payment/invoiceDialog.vue'
import { ref } from 'vue'
import { mapGetters } from 'vuex'
export default {
  name: 'InvoicesList',
  components: { Invoice, InvoiceDialog },
  props: {
    modelValue: [Array],
    hourlyRate: String,
    readonly: Boolean,
    showCost: Boolean,
    amount: Number,
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
        date: this.getRefDateFormat(new Date()),
        projectId: 0,
        projectName: '',
      },
      index: -1,
    }
  },
  methods: {
    getState() {
      return this.creating
    },
    newInvoice(newInv) {
      let invoices = this.addNewInvoiceToList(newInv)
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
    updateInvoice(invoice) {
      this.invoices.splice(this.index, 1)
      let invoices = this.addNewInvoiceToList(invoice)
      this.$emit('update:modelValue', invoices)
    },
    addNewInvoiceToList(newInv) {
      let invoices = []
      if (this.user.showDateOnInvoiceLine) {
        let isDateAdded = false
        this.invoices.forEach((tmpInvoice, index) => {
          if (isDateAdded) {
            invoices.push(tmpInvoice)
          } else {
            let tmpDate = new Date(tmpInvoice.date.replace(/-/g, '/'))
            let invDate = new Date(newInv.date.replace(/-/g, '/'))
            if (tmpDate > invDate) {
              invoices.push(newInv)
              isDateAdded = true
              invoices.push(tmpInvoice)
            } else {
              invoices.push(tmpInvoice)
              if (index == this.invoices.length - 1) {
                invoices.push(newInv)
                isDateAdded = true
              } else {
                let afterDate = new Date(this.invoices[index + 1].date.replace(/-/g, '/'))
                if (afterDate > invDate) {
                  invoices.push(newInv)
                  isDateAdded = true
                }
              }
            }
          }
        })
        if (!isDateAdded) {
          invoices.push(newInv)
        }
      } else {
        invoices = [...this.invoices, newInv]
      }
      return invoices
    },
    getRefDateFormat(date) {
      return ref(
        date.getFullYear() +
          '/' +
          (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) +
          '/' +
          date.getDate()
      )
    },
    getTotalHours() {
      let count = 0
      if (this.invoices && this.invoices.length > 0) {
        this.invoices.forEach((detail) => {
          if (detail.price == 0) {
            count += detail.quantity
          }
        })
      }
      return count
    },
    isDisplayHours() {
      if (this.invoices && this.invoices.length > 0) {
        let hasLabor = false
        this.invoices.forEach((detail) => {
          if (detail.price == 0) {
            hasLabor = true
            return
          }
        })
        return hasLabor
      }
      return false
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
    hourlyRate: {
      immediate: true,
      handler(newVal) {
        this.hourlyRateUpdate = newVal
      },
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
}
</script>

<style></style>
