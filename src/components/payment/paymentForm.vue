<template>
  <q-form @submit="submit" class="q-ma-md" ref="paymentForm">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <p class="q-mt-none q-mb-xs text-weight-medium">Do you want to?</p>
        <q-radio v-model="paymentType" val="request" label="Request"/>
        <q-radio v-model="paymentType" val="reminder" label="Reminder"/>
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
      <div class="col-4">
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
      <div class="col-4 col-md-3">
        <p class="q-mt-none q-mb-xs text-weight-medium">Currency you want to receive</p>
        <q-select
          v-model="payment.paymentMethod"
          :rules="[(val) => !!val || 'Currency is required']"
          :options="paymentMethods"
          placeholder="Payment Type"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          outlined
          dense
          stack-label
          hide-bottom-space
        />
      </div>
      <div class="col-8 col-md-9">
        <p class="q-mt-none q-mb-xs text-weight-medium">Your currency address</p>
        <q-input
          v-model="payment.paymentAddress"
          :rules="[(val) => !!val || 'Address is required']"
          placeholder="payment address"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
        />
      </div>
      <div class="col-12">
        <q-expansion-item
          v-model="expanded"
          label="Payment invoices"
          caption="Click to expand"
        >
          <div class="q-py-md">
            <q-input style="max-width: 200px"
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
          <invoices v-model="payment.details" :hourlyRate="Number(payment.hourlyRate)"></invoices>
        </q-expansion-item>
      </div>
    </div>
    <div class="row justify-end">
<<<<<<< HEAD
      <q-btn :label="payment.id > 0 ? 'Update' : 'Send'" type="submit" color="primary" />
      <q-btn label="Cancel" type="button" color="white" text-color="black" @click="$emit('cancel')" />
=======
      <q-btn label="Mark as draft" type="button" color="primary" @click="submit(true)" :disable="handling">
        <q-tooltip>
          'Mark as draft' will not notify the payment to the {{ paymentType === "request" ? "sender" : "receiver"}}
        </q-tooltip>
      </q-btn>
      <q-btn label="Send" type="submit" color="primary" :disable="handling">
        <q-tooltip>
          'Send' will notify the payment to the {{ paymentType === "request" ? "sender" : "receiver"}}
        </q-tooltip>
      </q-btn>
      <q-btn label="Cancel" type="button" color="white" text-color="black" @click="$emit('cancel')"/>
>>>>>>> 2f17807 (complete invoices for payment form)
    </div>
  </q-form>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS } from "src/consts/paymentType"
import { emailPattern } from "src/helper/validations"
import Invoices from "components/payment/invoices"

const DESTINATION_CHECK_NONE = 0
const DESTINATION_CHECK_CHECKING = 1
const DESTINATION_CHECK_FAIL = 2
const DESTINATION_CHECK_DONE = 3

export default {
  name: "paymentForm",
  components: {Invoices},
  data() {
    return {
      paymentType: "request",
      expanded: false,
      partner: {
        id: 0,
        value: "",
        status: DESTINATION_CHECK_NONE,
        error: "",
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
        console.log(newPayment)
        if (newPayment.receiverId === this.user.id) {
          this.paymentType = "request"
        } else {
          this.paymentType = "reminder"
        }
        if (newPayment.contactMethod === "email") {
          this.partner.id = 0
          this.partner.value = newPayment.externalEmail
          return
        }
        this.partner.value = newPayment.contactMethod === "internal" ? newPayment.senderName : newPayment.senderEmail
      }
    },
  },
  methods: {
    checkingDestination($e) {
      this.partner.status = DESTINATION_CHECK_NONE;
      this.partner.error = ""
      this.partner.id = 0
      if(!this.partner.value) {
        return
      }
      if(emailPattern.test(this.partner.value)) {
        this.partner.status = DESTINATION_CHECK_DONE;
        this.payment.contactMethod = "email"
        this.payment.senderEmail = this.partner.value
      } else {
        this.partner.status = DESTINATION_CHECK_CHECKING;
        this.$api.get(`/user/exist-checking?userName=${this.partner.value}`)
          .then((res) => {
            if (res.data.data.found) {
              this.partner.status = DESTINATION_CHECK_DONE;
              this.partner.id = res.data.data.id;
              this.payment.contactMethod = "internal"
            } else {
              this.partner.status = DESTINATION_CHECK_FAIL;
              this.partner.error = res.data.data.message
            }
          })
          .catch(() => {
            this.partner.status = DESTINATION_CHECK_FAIL;
            this.partner.error = "the user name is not found"
          })
      }
    },
    submit(isDraft) {
      if (this.submitting) {
        return
      }
      const payment = this.payment
      payment.hourlyRate = Number(payment.hourlyRate)
      payment.isDraft = !!isDraft
      payment.externalEmail = this.partner.value
      if (this.paymentType === "request") {
        payment.senderId = this.partner.id
        payment.receiverId = this.user.id
      } else {
        payment.senderId = this.user.id
        payment.receiverId = this.partner.id
      }
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
  },
  computed: {
    handling() {
      if (this.submitting) {
        return true
      }
      return this.partner.status === DESTINATION_CHECK_CHECKING;
    },
    partnerError: function () {
      return this.partner.status === DESTINATION_CHECK_FAIL;
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
