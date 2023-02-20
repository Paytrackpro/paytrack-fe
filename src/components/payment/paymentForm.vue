<template>
  <q-form @submit="submit" class="q-ma-md" ref="paymentForm">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-3">
        <p class="q-mt-none q-mb-xs text-weight-medium">Do you want to?</p>
        <q-radio v-model="paymentType" val="request" label="Request" :disable="user.id !== payment.creatorId"/>
        <q-radio v-model="paymentType" val="reminder" label="Reminder" :disable="user.id !== payment.creatorId"/>
      </div>
      <div class="col-4">
        <p class="q-mt-none q-mb-xs text-weight-medium">
          Sender
          <q-icon name="info">
            <q-tooltip>
              The sender is person who will pay for the payment
            </q-tooltip>
          </q-icon>
        </p>
        <q-input v-if="paymentType === 'reminder'"
          v-model="user.userName"
          placeholder="Sender"
          readonly
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          :error="false"
          error-message=""
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input v-else
          v-model="partner.value"
          placeholder="Sender"
          :readonly="user.id !== payment.creatorId"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          @blur="checkingDestination"
          :rules="[ val => !!val || 'Sender is required' ]"
          :error="partnerError"
          :error-message="partner.error"
          hint="expect an user name on mgmt or an email address"
        >
          <template v-slot:prepend>
            <q-icon name="person_add" />
          </template>
        </q-input>
      </div>
      <div class="col-4">
        <p class="q-mt-none q-mb-xs text-weight-medium">
          Receiver
          <q-icon name="info">
            <q-tooltip>
              The receiver is person who will receive the payment
            </q-tooltip>
          </q-icon>
        </p>
        <q-input v-if="paymentType === 'request'"
         v-model="user.userName"
         placeholder="Sender"
         readonly
         outlined
         dense
         lazy-rules
         stack-label
         hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input v-else
          v-model="partner.value"
          placeholder="Receiver"
          :readonly="user.id !== payment.creatorId"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          @blur="checkingDestination"
          :rules="[ val => !!val || 'Receiver is required' ]"
          :error="partnerError"
          :error-message="partner.error"
          hint="expect an user name on mgmt or an email address"
        >
          <template v-slot:prepend>
            <q-icon name="person_add" />
          </template>
        </q-input>
      </div>
      <div class="col-3">
        <p class="q-mt-none q-mb-xs text-weight-medium">Amount(USD)</p>
        <q-input
          v-model="amount"
          placeholder="Amount"
          type="number"
          readonly
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          :rules="[ val => val >0 || 'Amount > 0. Please fill up the invoices and hourly rate' ]"
        >
          <template v-slot:prepend>
            <q-icon name="attach_money" />
          </template>
        </q-input>
      </div>
      <div class="col-8"/>
      <div v-if="paymentType === 'reminder'" class="col-4 col-md-3">
        <p class="q-mt-none q-mb-xs text-weight-medium">Choose payment method</p>
        <q-select
          v-model="setting.type"
          :rules="[ val => !!val || 'Currency is required'  ]"
          :options="paymentMethods"
          placeholder="Payment Type"
          :option-label="v => v.label"
          :option-value="v => v.value"
          emit-value
          map-options
          outlined
          dense
          stack-label
          hide-bottom-space
          @input="changePaymentMethod"
        />
      </div>
      <div v-if="paymentType === 'reminder'" class="col-8 col-md-9">
        <p class="q-mt-none q-mb-xs text-weight-medium">Currency address</p>
        <q-input
          v-model="setting.address"
          :rules="[ val => !!val || 'Address is required'  ]"
          placeholder="payment address"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
        />
      </div>
      <div v-if="paymentType === 'request'" class="col-12">
        <payment-setting v-model="payment.paymentSettings" />
      </div>
      <div class="col-12">
        <q-expansion-item
          v-model="expanded"
          label="Payment invoices"
          caption="Click to expand"
        >
          <div class="row">
            <div class="col-3">
              <q-input style=""
               label="Hourly rate(USD)"
               dense
               lazy-rules
               stack-label
               outlined
               hide-bottom-space
               type="number"
               v-model="payment.hourlyRate"
               hint="Used to calculate cost from hours on invoices"
              />
            </div>
          </div>
          <invoices v-model="payment.details" :hourlyRate="Number(payment.hourlyRate)"></invoices>
        </q-expansion-item>
      </div>
    </div>
    <div class="row justify-end">
      <q-btn label="Mark as draft" type="button" color="primary" @click="submit(true)" :disable="handling">
        <q-tooltip>
          'Mark as draft' will not notify the payment to the {{ paymentType === "request" ? "sender" : "receiver" }}
        </q-tooltip>
      </q-btn>
      <q-btn label="Send" type="submit" color="primary" :disable="handling">
        <q-tooltip>
          'Send' will notify the payment to the {{ paymentType === "request" ? "sender" : "receiver" }}
        </q-tooltip>
      </q-btn>
      <q-btn label="Cancel" type="button" color="white" text-color="black" @click="$emit('cancel')"/>
    </div>
  </q-form>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS, PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST } from "src/consts/paymentType"
import { emailPattern } from "src/helper/validations"
import Invoices from "components/payment/invoices"
import PaymentSetting from "components/payment/paymentSetting"

const DESTINATION_CHECK_NONE = 0
const DESTINATION_CHECK_CHECKING = 1
const DESTINATION_CHECK_FAIL = 2
const DESTINATION_CHECK_DONE = 3

export default {
  name: "paymentForm",
  components: {Invoices, PaymentSetting},
  data() {
    return {
      paymentType: "request",
      expanded: false,
      setting: {
        type: "",
        address: ""
      },
      partner: {
        id: 0,
        value: "",
        status: DESTINATION_CHECK_NONE,
        error: "",
        paymentSettings: []
      },
      paymentMethods: PAYMENT_TYPE_OPTIONS,
      submitting: false,
    }
  },
  props: {
    payment: Object,
    user: Object,
  },
  watch: {
    payment: {
      immediate: true,
      handler(newPayment) {
        // setup correct sender and receiver view
        if (this.user.id) {
          if (newPayment.receiverId === this.user.id) {
            this.paymentType = PAYMENT_OBJECT_REQUEST
          } else {
            this.paymentType = PAYMENT_OBJECT_REMINDER
          }
        } else {
          if (newPayment.senderId) {
            this.paymentType = PAYMENT_OBJECT_REQUEST
          } else {
            this.paymentType = PAYMENT_OBJECT_REMINDER
          }
        }
        if (newPayment.contactMethod === "email") {
          this.partner.id = 0
          this.partner.value = newPayment.externalEmail
        } else {
          this.partner.value = this.paymentType === PAYMENT_OBJECT_REQUEST ? newPayment.senderName : newPayment.receiverName
          this.partner.id = this.paymentType === PAYMENT_OBJECT_REQUEST ? newPayment.senderId : newPayment.receiverId
        }
        // setup correct payment setting
        if (newPayment.paymentMethod && newPayment.paymentAddress) {
          this.setting = {
            type: newPayment.paymentMethod,
            address: newPayment.paymentAddress
          }
        } else {
          const settings = newPayment.paymentSettings || []
          let filled = true
          for (let setting of settings) {
            if (setting.isDefault) {
              this.setting = setting
              return
            }
          }
          if (!filled && settings.length > 0) {
            this.setting = settings[0]
          }
        }
      }
    },
    paymentType: {
      //immediate: true,
      handler(pType) {
        console.log(pType)
        if (this.$refs.paymentForm) {
          this.$refs.paymentForm.reset()
        }
        this.updateSettings(pType)
      }
    }
  },
  methods: {
    checkingDestination($e) {
      this.partner.status = DESTINATION_CHECK_NONE
      this.partner.error = ""
      this.partner.id = 0
      if(!this.partner.value) {
        return
      }
      if(emailPattern.test(this.partner.value)) {
        this.partner.status = DESTINATION_CHECK_DONE
        this.payment.contactMethod = "email"
        this.payment.senderEmail = this.partner.value
      } else {
        this.partner.status = DESTINATION_CHECK_CHECKING
        this.$api.get(`/user/exist-checking?userName=${this.partner.value}`)
          .then((res) => {
            if (res.data.data.found) {
              this.partner.status = DESTINATION_CHECK_DONE
              this.partner.id = res.data.data.id
              this.partner.paymentSettings = res.data.data.paymentSettings || []
              this.payment.contactMethod = "internal"
              this.updateSettings()
            } else {
              this.partner.status = DESTINATION_CHECK_FAIL
              this.partner.error = res.data.data.message
            }
          })
          .catch(() => {
            this.partner.status = DESTINATION_CHECK_FAIL
            this.partner.error = "the user name is not found"
          })
      }
    },
    submit(isDraft) {
      if (this.submitting) {
        return
      }
      const payment = { ...this.payment }
      payment.hourlyRate = Number(payment.hourlyRate)
      payment.isDraft = isDraft === true
      if (payment.contactMethod === "email") {
        payment.externalEmail = this.partner.value
      }
      payment.paymentMethod = this.setting.type
      payment.paymentAddress = this.setting.address
      if (this.paymentType === "request") {
        payment.senderId = this.partner.id
        payment.receiverId = this.user.id
      } else {
        payment.senderId = this.user.id
        payment.receiverId = this.partner.id
      }
      console.log(payment)
      this.submitting = true
      let url = `/payment`
      let successNotify = "Payment sent"
      if (payment.id > 0) {
        url = `/payment/${payment.id}`
        successNotify = "Payment updated"
      }
      this.$api
        .post(url, payment)
        .then((res) => {
          this.$q.notify({
            message: successNotify,
            color: "positive",
            icon: "check",
          })
          this.submitting = false
          this.$emit("saved", res.data.data.payment)
        })
        .catch((err) => {
          this.submitting = false
          this.$q.notify({
            message: "Error",
            color: "negative",
            icon: "alert",
          })
        })
    },
    changePaymentMethod(val) {
      const settings = this.payment.paymentSettings || []
      this.setting.address = ""
      for (let setting of settings) {
        if (setting.type === this.setting.type) {
          this.setting.address = setting.address
        }
      }
    },
    updateSettings(pType) {
      pType = pType || this.paymentType
      if (pType === PAYMENT_OBJECT_REQUEST) {
        this.payment.paymentSettings = this.user.paymentSettings || []
      }
      if (pType === PAYMENT_OBJECT_REMINDER) {
        this.payment.paymentSettings = this.partner.paymentSettings || []
      }
      let isSet = false
      for (let setting of this.payment.paymentSettings) {
        if (setting.isDefault) {
          isSet = true
          this.setting.type = setting.type
          this.setting.address = setting.address
        }
      }
      if (!isSet && this.payment.paymentSettings.length > 0) {
        const setting = this.payment.paymentSettings[0]
        this.setting.type = setting.type
        this.setting.address = setting.address
      } else {
        this.setting.type = ""
        this.setting.address = ""
      }
    }
  },
  computed: {
    handling() {
      if (this.submitting) {
        return true
      }
      return this.partner.status === DESTINATION_CHECK_CHECKING
    },
    partnerError: function () {
      return this.partner.status === DESTINATION_CHECK_FAIL
    },
    amount: function () {
      if (!this.payment.details) {
        return 0
      }
      let amount = 0
      for (let invoice of this.payment.details) {
        amount += Number(invoice.cost)
      }
      return amount
    }
  }
}
</script>

<style scoped></style>
