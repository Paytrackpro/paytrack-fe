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
          label="Send"
          color="primary"
          class="btn btn-animated"
          :disable="submitting"
          @click="submit(false)"
        >
          <q-tooltip> 'Send' will notify the payment to the recipient </q-tooltip>
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
  <q-form @submit="submit" class="q-pa-md" ref="paymentForm">
    <div class="row q-gutter-md">
      <div class="col-12 col-md-6">
        <div class="row">
          <div class="col-12 col-md-7">
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
          <div class="col-12 col-md-1"></div>
          <div class="col-12 col-md-4">
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
              :rules="[(val) => val > 0 || inputAmountMessage]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
            </q-input>
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
      />
    </div>
    <div class="row q-py-lg" v-if="isInvoiceMode">
      <div class="col">
        <invoices-mode
          ref="invoiceMode"
          @update:modelValue="updateDetail"
          v-model="inPayment.details"
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
        this.isInvoiceMode = payment.details.length > 0
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
    }),
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
      payment.paymentMethod = this.setting.type
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
