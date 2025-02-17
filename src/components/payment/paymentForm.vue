<template>
  <q-card-section class="card-header">
    <div class="row justify-between">
      <div class="row">
        <div class="text-h6 title-case">{{ isEdit ? 'Payment request' : 'Create payment request' }}</div>
        <payment-status v-if="isEdit && payment.status" :paymentModel="payment" class="q-ml-md" :isShowIcon="true" />
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          v-if="inPayment.status === 'draft' || inPayment.status === 'rejected' || inPayment.status === ''"
          :label="createPayUrlCheck ? 'Create Url' : 'Send'"
          color="primary"
          class="btn btn-animated"
          :disable="submitting"
          @click="handleAction"
        >
          <q-tooltip>
            {{
              createPayUrlCheck
                ? '"Create Url" will notify the payment to the recipient.'
                : '"Send" will notify the payment to the recipient.'
            }}
          </q-tooltip>
        </q-btn>
        <q-btn
          :label="inPayment.status === '' ? 'Save as draft' : 'Update'"
          type="button"
          color="secondary"
          class="btn btn-animated"
          @click="submit(true)"
          :disable="submitting"
        >
          <q-tooltip v-if="inPayment.status === ''">
            'Save as draft' will not notify the payment to the recipient
          </q-tooltip>
        </q-btn>
        <q-btn
          label="Cancel"
          class="btn btn-animated"
          type="button"
          color="white"
          text-color="black"
          @click="$emit('cancel')"
        />
      </div>
    </div>
  </q-card-section>
  <q-card class="q-pa-none q-pl-md q-pr-md" v-if="createPayUrlCheck">
    <q-card-section class="q-pa-none q-mb-none q-mt-md">
      <q-paragraph class="q-mb-md">*This URL is unique and anyone who gets this URL can pay the bill.</q-paragraph>
    </q-card-section>
  </q-card>
  <q-form
    @submit="submit"
    :class="['q-pr-lg q-pl-lg q-pb-lg', createPayUrlCheck ? 'q-pt-sm' : 'q-pt-lg']"
    ref="paymentForm"
  >
    <div class="row q-gutter-md">
      <div class="col-12 col-md-6">
        <div class="row">
          <div class="col-12" v-if="createPayUrlCheck">
            <q-checkbox v-model="createPayUrlCheck" label="Create Payment URL" />
          </div>
          <div class="col-12 col-md-7" v-if="!createPayUrlCheck">
            <p class="q-mb-xs text-weight-medium">
              Recipient
              <q-icon name="info">
                <q-tooltip> The user who will be paying the payment request </q-tooltip>
              </q-icon>
            </p>
            <q-input-system-user
              v-model="partner"
              placeholder="Recipient"
              :readonly="user.id !== inPayment.senderId || ['draft', ''].indexOf(inPayment.status) === -1"
              outlined
              dense
              ref="inputReceiver"
              lazy-rules
              stack-label
              hide-bottom-space
              :rules="[(val) => !!val || 'Recipient is required']"
              hint="Expects a username on mgmt or an email address"
            />
          </div>
          <div class="col-12 col-md-1" v-if="!createPayUrlCheck"></div>
          <div class="col-12 col-md-4" v-if="!isInvoiceMode">
            <p class="q-mt-none q-mb-xs text-weight-medium">Amount (USD)</p>
            <q-input
              class="no-control-button"
              v-model="this.inPayment.amount"
              placeholder="Amount"
              type="number"
              :readonly="isInvoiceMode"
              outlined
              dense
              lazy-rules
              stack-label
              min="0"
              :rules="[(val) => val > 0 || inputAmountMessage]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
            </q-input>
          </div>
          <div class="col-12" v-if="!createPayUrlCheck">
            <q-checkbox v-model="createPayUrlCheck" label="Create Payment URL" />
          </div>
          <div class="col-12 col-md-4" v-if="isInvoiceMode">
            <p class="q-mb-xs">
              <b>Total Hours:&nbsp;&nbsp;</b>
              <span class="amount-text">{{
                (totalHours % 1 != 0 ? totalHours.toFixed(2) : totalHours) + ' hour' + (totalHours > 1.0 ? 's' : '')
              }}</span>
            </p>
            <p class="q-mb-xs">
              <b>Total Cost (USD):&nbsp;&nbsp;</b>
              <span class="amount-text"
                >${{ inPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span
              >
            </p>
          </div>
          <div class="col-12 q-my-lg">
            <custom-input
              :label="'Description'"
              :rows="5"
              v-model="inPayment.description"
              :placeholder="'Description for Payment Request'"
              :type="'textarea'"
            />
          </div>
        </div>
      </div>
      <div class="col-12 col-md-5 q-ml-lg">
        <payment-setting v-model="inPayment.paymentSettings" ref="setting" label="Payment Settings" />
      </div>
    </div>
    <div class="row">
      <q-toggle v-model="isInvoiceMode" color="primary" label="Invoice Mode" />
    </div>
    <div class="row q-gutter-md q-mt-xs" v-if="isInvoiceMode">
      <custom-input
        class="col-12 col-sm-4 col-lg-2"
        :label="'Hourly Rate(USD/h)'"
        v-model="inPayment.hourlyRate"
        :type="'number'"
        :rules="priceRules"
        :minValue="0"
      />
    </div>
    <div class="row" v-if="isInvoiceMode">
      <q-checkbox class="row q-mt-xs" label="Show Date on Invoice Line" v-model="inPayment.showDateOnInvoiceLine" />
      <q-checkbox
        class="row q-mt-xs"
        label="Invoice Project"
        v-model="inPayment.showProjectOnInvoice"
        v-if="projectList.length > 0"
      />
      <q-select
        class="row q-mt-xs q-ml-sm"
        v-if="inPayment.showProjectOnInvoice && projectList.length > 0"
        v-model="inPayment.projectId"
        :options="projectOption"
        outlined
        dense
        style="min-width: 250px"
        lazy-rules
        stack-label
        emit-value
        map-options
        borderless
      />
    </div>
    <div class="row q-py-lg" v-if="isInvoiceMode">
      <div class="col">
        <invoices-mode
          ref="invoiceMode"
          @update:modelValue="updateDetail"
          v-model="inPayment.details"
          :amount="inPayment.amount"
          :showDateOnInvoiceLine="inPayment.showDateOnInvoiceLine"
          :showProjectOnInvoice="inPayment.showProjectOnInvoice"
          v-model:hourlyRate="inPayment.hourlyRate"
          :showCost="true"
        />
      </div>
    </div>
  </q-form>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS } from 'src/consts/paymentType'
import QInputSystemUser from 'components/common/qInputSystemUser'
import PaymentSetting from 'components/payment/paymentSetting'
import InvoicesMode from 'components/payment/invoicesMode'
import customInput from '../common/custom_input.vue'
import { mapActions } from 'vuex'
import PaymentStatus from 'components/payment/paymentStatus'
export default {
  name: 'paymentForm',
  components: { PaymentSetting, QInputSystemUser, InvoicesMode, PaymentStatus, customInput },
  props: {
    payment: Object,
    user: Object,
    token: String,
    paymentType: String,
    isEdit: Boolean,
    createType: String,
  },
  data() {
    return {
      setting: {
        type: '',
        address: '',
      },
      partner: {
        id: 0,
        value: '',
        paymentSettings: [],
      },
      paymentMethods: PAYMENT_TYPE_OPTIONS,
      submitting: false,
      inPayment: {},
      priceRules: [
        (v) =>
          (v && v.toString().split('.').length < 2) ||
          (v && v.toString().split('.')[1].length <= 2) ||
          'No more than 2 digits after the decimal point',
      ],
      isInvoiceMode: false,
      totalHours: 0.0,
      projectList: [],
      projectOption: [],
      createPayUrlCheck: false,
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
          if (!this.edit && !this.inPayment.projectId && this.projectList && this.projectList.length > 0) {
            this.inPayment.projectId = this.projectList[0].projectId
            this.inPayment.projectName = this.projectList[0].projectName
          }
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    }
  },
  watch: {
    isInvoiceMode(value) {
      if (value) {
        // calculate amount
        this.inPayment.amount = this.invoicesAmount()
      } else {
        this.inPayment.amount = 0
      }
    },
    payment: {
      immediate: true,
      handler(newPayment) {
        const payment = { ...newPayment }
        this.partner.contactMethod = payment.contactMethod
        if (payment.contactMethod === 'email') {
          this.partner.value = newPayment.externalEmail
          this.partner.id = 0
        } else {
          this.partner.value = payment.receiverName
          this.partner.id = payment.receiverId
        }
        this.isInvoiceMode = payment.details && payment.details.length > 0
        this.inPayment = payment
        if (!this.isEdit) {
          this.inPayment.hourlyRate = this.user.hourlyLaborRate
        }
        // setup correct payment setting
        if (payment.paymentMethod && payment.paymentAddress) {
          this.setting = {
            type: payment.paymentMethod,
            address: payment.paymentAddress,
          }
        } else {
          const settings = payment.paymentSettings || []
          let filled = true
          for (let setting of settings) {
            if (setting.isDefault) {
              this.setting = { ...setting }
              return
            }
          }
          if (!filled && settings.length > 0) {
            this.setting = {
              ...settings[0],
            }
          }
        }
      },
    },
  },
  methods: {
    ...mapActions({
      savePayment: 'payment/save',
      createPayUrl: 'payment/createPayUrl',
    }),
    handleAction() {
      if (this.createPayUrlCheck) {
        this.createPaymentUrl()
      } else {
        this.submit(false)
      }
    },
    async submit(isDraft) {
      if (this.submitting || (!isDraft && !this.partner.contactMethod)) {
        return
      }

      if (this.isInvoiceMode) {
        if (this.$refs.invoiceMode.getState()) {
          this.$q.notify({
            type: 'negative',
            message: 'Please complete the invoice',
            position: 'bottom',
          })
          return
        }
      }

      const inPutObject = await this.$refs.inputReceiver.validateAndGetValue()
      var valid
      //if create and update, validate some require field
      if (!isDraft || (isDraft && this.inPayment.status !== '' && this.inPayment.status !== 'draft')) {
        valid = await this.$refs.paymentForm.validate()
        if (!valid) {
          return
        }
      }

      if (!isDraft && !this.inPayment.amount > 0) {
        this.$q.notify({
          type: 'negative',
          message:
            'Amount must greater than 0. Please fill up the invoices and hourly rate or type amount in simple mode',
        })
        return
      }
      const payment = { ...this.inPayment }
      payment.hourlyRate = Number(payment.hourlyRate)
      if (isDraft !== true) {
        payment.status = 'sent'
      }
      if (!isDraft || (isDraft && inPutObject && inPutObject.value)) {
        payment.contactMethod = inPutObject.contactMethod
        if (payment.contactMethod === 'email') {
          if (!payment.id || this.user.id === payment.senderId) {
            payment.externalEmail = inPutObject.value
          }
        }
        payment.receiverId = inPutObject.id
      }
      payment.paymentMethod = this.setting.tytokpe
      payment.paymentAddress = this.setting.address
      payment.token = this.token
      this.submitting = true
      let successNotify = 'Payment request created'
      if (payment.id > 0) {
        successNotify = 'Payment request updated'
      }
      if (isDraft !== true) {
        successNotify = 'Payment request sent'
      }
      if (this.inPayment.showProjectOnInvoice) {
        this.projectList.find((project) => {
          if (project.projectId === this.inPayment.projectId) {
            this.inPayment.projectName = project.projectName
            payment.projectName = project.projectName
          }
        })
        payment.details.forEach((detail) => {
          detail.projectId = this.inPayment.projectId
          detail.projectName = this.inPayment.projectName
        })
      }
      if (!this.isInvoiceMode) {
        payment.details = []
      }
      payment.amount = Number(payment.amount)
      const { data } = await this.savePayment(payment)
      this.submitting = false
      if (data) {
        this.$emit('saved', data.payment)
        this.$q.notify({
          message: successNotify,
          color: 'positive',
          icon: 'check',
        })
      }
    },
    changePaymentMethod(val) {
      const settings = this.inPayment.paymentSettings || []
      this.setting.address = ''
      for (let setting of settings) {
        if (setting.type === this.setting.type) {
          this.setting.address = setting.address
        }
      }
    },
    updateDetail(details) {
      this.inPayment.details = details
      this.inPayment.amount = this.invoicesAmount()
      this.setTotalHours(details)
    },
    invoicesAmount() {
      if (!this.inPayment.details) {
        return 0
      }
      let amount = 0
      for (let invoice of this.inPayment.details) {
        amount += Number(invoice.cost)
      }
      return amount.toFixed(2)
    },
    setTotalHours(invoices) {
      let count = 0
      if (invoices && invoices.length > 0) {
        invoices.forEach((detail) => {
          if (detail.price == 0) {
            count += detail.quantity
          }
        })
      }
      this.totalHours = count
    },
    async createPaymentUrl() {
      if (this.submitting || !this.partner.contactMethod) {
        return
      }

      if (this.isInvoiceMode) {
        if (this.$refs.invoiceMode.getState()) {
          this.$q.notify({
            type: 'negative',
            message: 'Please complete the invoice',
            position: 'bottom',
          })
          return
        }
      }
      var valid
      if (this.inPayment.status !== '' && this.inPayment.status !== 'draft') {
        valid = await this.$refs.paymentForm.validate()
        if (!valid) {
          return
        }
      }

      if (!this.inPayment.amount > 0) {
        this.$q.notify({
          type: 'negative',
          message:
            'Amount must greater than 0. Please fill up the invoices and hourly rate or type amount in simple mode',
        })
        return
      }
      const payment = { ...this.inPayment }
      payment.hourlyRate = Number(payment.hourlyRate)
      payment.status = 'sent'
      payment.paymentMethod = this.setting.type
      payment.paymentAddress = this.setting.address
      payment.token = this.token
      this.submitting = true
      let successNotify = 'Payment url created'

      if (this.inPayment.showProjectOnInvoice) {
        this.projectList.find((project) => {
          if (project.projectId === this.inPayment.projectId) {
            this.inPayment.projectName = project.projectName
            payment.projectName = project.projectName
          }
        })
        payment.details.forEach((detail) => {
          detail.projectId = this.inPayment.projectId
          detail.projectName = this.inPayment.projectName
        })
      }
      if (!this.isInvoiceMode) {
        payment.details = []
      }
      payment.amount = Number(payment.amount)
      const { data } = await this.createPayUrl(payment)
      this.submitting = false
      if (data) {
        this.$emit('saved', data.payment)
        this.$q.notify({
          message: successNotify,
          color: 'positive',
          icon: 'check',
        })
      }
    },
  },
  computed: {
    canEditInvoice: function () {
      return this.user.id === this.inPayment.senderId
    },
    inputAmountMessage() {
      return this.isInvoiceMode ? 'Enter invoice details below' : 'Please enter amount'
    },
  },
}
</script>

<style scoped></style>
