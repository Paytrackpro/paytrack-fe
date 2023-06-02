<template>
  <q-dialog v-model="modelValue">
    <q-card style="width: 550px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">{{ type === 'labor' ? 'Add Labor' : 'Add Material' }}</div>
      </q-card-section>
      <q-card-section class="q-pt-xs q-px-lg">
        <div class="row items-start justify-between">
          <custom-input
            class="col-3"
            :label="type === 'labor' ? 'Hours' : 'Quantity'"
            v-model="invoice.quantity"
            :type="'number'"
            :customStyle="'width:70%'"
            @update:modelValue="calculateCost"
            :rules="[(val) => !!val || 'Required field']"
          />
          <custom-input
            v-if="type === 'labor'"
            class="col-4"
            :label="'Hourly Rate (USD/h)'"
            v-model="hourlyRateInput"
            :type="'number'"
            :customStyle="'width:70%'"
            @update:modelValue="calculateCost"
            :rules="priceRules"
          />
          <custom-input
            v-if="type === 'material'"
            class="col-4"
            :label="'Price'"
            v-model="invoice.price"
            :type="'number'"
            :customStyle="'width:70%'"
            @update:modelValue="calculateCost"
            :rules="priceRules"
          />
          <custom-field :label="'Total Cost (USD)'" class="col-3" :value="'$ ' + cost" />
        </div>
        <custom-input
          class="q-mt-lg"
          :label="'Description'"
          :rows="5"
          v-model="invoice.description"
          :type="'textarea'"
          :error="submitted && !invoice.description"
        />
      </q-card-section>
      <q-card-actions align="center" class="q-pb-md">
        <q-btn color="primary" label="Save" @click="save()" />
        <q-btn label="Cancel" type="button" color="white" text-color="black" @click="cancel()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import customInput from 'src/components/common/custom_input.vue'
import customField from 'src/components/common/custom_field.vue'
export default {
  name: 'InvoiceDialog',
  components: { customInput, customField },
  props: {
    i: Number,
    mainModelValue: Object,
    hourlyRate: String,
    readonly: Boolean,
    dialogModelValue: Boolean,
    type: String,
    invoiceInput: Object,
    isEdit: Boolean,
  },
  data() {
    return {
      editing: false,
      submitted: false,
      show_dialog: this.invoice_dialog,
      invoice: {},
      hourlyRateInput: '',
      priceRules: [
        (v) =>
          (v && v.toString().split('.').length < 2) ||
          (v && v.toString().split('.')[1].length <= 2) ||
          'No more than 2 digits after the decimal point',
      ],
      modelValue: false,
    }
  },
  methods: {
    save() {
      if (this.invoice.cost <= 0) {
        return
      }
      if (this.isEdit) {
        this.$emit('update:mainModelValue', {
          quantity: Number(this.invoice.quantity),
          price: Number(this.invoice.price),
          cost: Number(this.invoice.cost),
          description: this.invoice.description,
        })
      } else {
        this.$emit('save', {
          quantity: Number(this.invoice.quantity),
          price: Number(this.invoice.price),
          cost: Number(this.invoice.cost),
          description: this.invoice.description,
        })
      }
      if (this.hourlyRateInput !== this.hourlyRate) {
        this.$emit('update:hourlyRate', this.hourlyRateInput)
      }
      this.cancel()
    },
    cancel() {
      this.$emit('update:dialogModelValue', false)
      this.$emit('update:invoiceInput', {
        quantity: '',
        price: '',
        cost: 0,
        description: '',
      })
    },
    calculateCost() {
      let price = Number(this.invoice.price)
      if (this.type === 'labor') {
        price = this.hourlyRateInput
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
  },
  watch: {
    hourlyRate: {
      immediate: true,
      handler(newVal) {
        this.hourlyRateInput = newVal
      },
    },
    dialogModelValue: {
      immediate: true,
      handler(newVal) {
        this.modelValue = newVal
      },
    },
    invoiceInput: {
      immediate: true,
      handler(newVal) {
        this.invoice = newVal
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
