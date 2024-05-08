<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card style="width: 550px; max-width: 80vw">
      <q-card-section class="row">
        <div class="text-h6">{{ isEdit ? 'Edit' : 'Add' }}{{ type === 'labor' ? ' Labor' : ' Material' }}</div>
      </q-card-section>
      <q-card-section class="q-pt-xs q-px-lg">
        <div class="row items-start" v-if="showDateOnInvoiceLine">
          <div>
            <p>
              <b class="text-weight-medium title-case">Date </b>
            </p>
            <q-input filled v-model="invoice.date" :rules="['date']">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="invoice.date"
                      v-close-popup="dateClosePopup"
                      @navigation="dateClosePopup = false"
                      @update:model-value="updateInvoiceDate"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
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
        <div class="items-start" v-if="!showProjectOnInvoice && projectList.length > 0">
          <p class="q-mt-lg text-weight-medium title-case">Project</p>
          <q-select
            v-model="invoice.projectId"
            :options="projectOption"
            outlined
            dense
            style="max-width: 250px"
            lazy-rules
            stack-label
            emit-value
            map-options
            borderless
          />
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
import { ref } from 'vue'
import { mapGetters } from 'vuex'
export default {
  name: 'InvoiceDialog',
  components: { customInput, customField },
  props: {
    mainModelValue: Object,
    hourlyRate: String,
    readonly: Boolean,
    dialogModelValue: Boolean,
    type: String,
    invoiceInput: Object,
    isEdit: Boolean,
    showDateOnInvoiceLine: Boolean,
    showProjectOnInvoice: Boolean,
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
      dateClosePopup: ref(true),
      projectList: [],
      projectOption: [],
    }
  },
  created() {
    if (this.projectList.length == 0) {
      //if projectList empty, get projectList
      this.$api
        .get(`/project/get-my-project`)
        .then((data) => {
          this.projectList = data
          this.projectList.forEach((project) => {
            this.projectOption.push({
              label: project.projectName,
              value: project.projectId,
            })
          })
          if (!this.edit && this.projectList && this.projectList.length > 0) {
            this.invoice.projectId = this.projectList[0].projectId
          }
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    }
  },
  methods: {
    save() {
      if (this.invoice.cost <= 0) {
        return
      }
      let projectName = this.getProjectName()
      if (this.isEdit) {
        this.$emit('updateInvoice', {
          quantity: Number(this.invoice.quantity),
          price: Number(this.invoice.price),
          cost: Number(this.invoice.cost),
          description: this.invoice.description,
          date: this.invoice.date,
          projectId: this.invoice.projectId,
          projectName: projectName,
        })
      } else {
        this.$emit('save', {
          quantity: Number(this.invoice.quantity),
          price: Number(this.invoice.price),
          cost: Number(this.invoice.cost),
          description: this.invoice.description,
          date: this.invoice.date,
          projectId: this.invoice.projectId,
          projectName: projectName,
        })
      }
      if (this.hourlyRateInput !== this.hourlyRate) {
        this.$emit('update:hourlyRate', this.hourlyRateInput)
      }
      this.cancel()
    },
    getProjectName() {
      let projectName = ''
      this.projectList.forEach((project) => {
        if (project.projectId == this.invoice.projectId) {
          projectName = project.projectName
          return
        }
      })
      return projectName
    },
    cancel() {
      this.$emit('update:dialogModelValue', false)
      const now = new Date()
      if (this.isEdit) {
        this.invoice = {
          quantity: '',
          price: '',
          cost: 0,
          description: '',
          projectId: 0,
          projectName: '',
          date: this.getRefDateFormat(now),
        }
      }
      if (!this.isEdit) {
        this.$emit('update:invoiceInput', {
          quantity: '',
          price: '',
          cost: 0,
          description: '',
          projectId: 0,
          projectName: '',
          date: this.getRefDateFormat(now),
        })
      }
    },
    calculateCost() {
      let price = Number(this.invoice.price)
      if (this.type === 'labor') {
        price = this.hourlyRateInput
      }
      this.invoice.cost = Number(this.invoice.quantity) * price
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
    updateInvoiceDate($e) {
      this.dateClosePopup = true
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
      handler(newVal) {
        this.hourlyRateInput = newVal
      },
    },
    dialogModelValue: {
      immediate: true,
      handler(newVal) {
        this.modelValue = newVal
        if (newVal && !this.isEdit && this.projectList && this.projectList.length > 0) {
          this.invoice.projectId = this.projectList[0].projectId
        }
      },
    },
    invoiceInput: {
      immediate: true,
      handler(newVal) {
        this.invoice.quantity = newVal.quantity
        this.invoice.price = newVal.price
        this.invoice.cost = newVal.cost
        this.invoice.description = newVal.description
        this.invoice.date = newVal.date
        this.invoice.projectId = newVal.projectId
        this.invoice.projectName = newVal.projectName
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
