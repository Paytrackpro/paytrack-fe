<template>
  <q-form @submit="submit" class="q-ma-md">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-12">
        <p class="q-mt-none q-mb-xs text-weight-medium">The destination you want to send</p>
        <q-input
          v-model="destination.value"
          placeholder="Destination"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          @blur="checkingDestination"
          :rules="[(val) => !!val || 'Destination is required']"
          :error="destinationError"
          :error-message="destination.error"
          hint="expect an user name on mgmt or an email address"
        >
          <template v-slot:prepend>
            <q-icon name="person_add" />
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <p class="q-mt-none q-mb-xs text-weight-medium">The amount you want to received(USD)</p>
        <q-input
          v-model="payment.amount"
          :rules="[(val) => val > 0 || 'Amount must be greater than 0']"
          placeholder="Amount"
          type="number"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="attach_money" />
          </template>
        </q-input>
      </div>
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
        <p class="q-mt-none q-mb-xs text-weight-medium">Tell more about your payment request</p>
        <q-input
          v-model="payment.description"
          :rules="[(val) => !!val || 'Description is required']"
          type="textarea"
          placeholder="description"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
        />
      </div>
    </div>
    <div class="row justify-end">
      <q-btn :label="payment.id > 0 ? 'Update' : 'Send'" type="submit" color="primary" />
      <q-btn label="Cancel" type="button" color="white" text-color="black" @click="$emit('cancel')" />
    </div>
  </q-form>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS } from "src/consts/paymentType"
import { emailPattern } from "src/helper/validations"

const DESTINATION_CHECK_NONE = 0
const DESTINATION_CHECK_CHECKING = 1
const DESTINATION_CHECK_FAIL = 2
const DESTINATION_CHECK_DONE = 3

export default {
  name: "paymentForm",
  data() {
    return {
      destination: {
        value: "",
        status: DESTINATION_CHECK_NONE,
        error: "",
      },
      userCheck: DESTINATION_CHECK_NONE,
      paymentMethods: PAYMENT_TYPE_OPTIONS,
      submitting: false,
    }
  },
  props: {
    payment: Object,
  },
  watch: {
    payment: {
      immediate: true,
      handler(newPayment) {
        this.destination.value =
          newPayment.contactMethod === "internal" ? newPayment.senderName : newPayment.senderEmail
      },
    },
  },
  methods: {
    checkingDestination: function ($e) {
      this.destination.status = DESTINATION_CHECK_NONE
      this.destination.error = ""
      if (this.destination.value.length === 0) {
        return
      }
      if (emailPattern.test(this.destination.value)) {
        this.destination.status = DESTINATION_CHECK_DONE
        this.payment.contactMethod = "email"
        this.payment.senderEmail = this.destination.value
      } else {
        this.destination.status = DESTINATION_CHECK_CHECKING
        this.$api
          .get(`/user/exist-checking?userName=${this.destination.value}`)
          .then((res) => {
            if (res.data.data.found) {
              this.destination.status = DESTINATION_CHECK_DONE
              this.payment.senderId = res.data.data.id
              this.payment.contactMethod = "internal"
            } else {
              this.destination.status = DESTINATION_CHECK_FAIL
              this.destination.error = res.data.data.message
            }
          })
          .catch(() => {
            this.destination.status = DESTINATION_CHECK_FAIL
            this.destination.error = "the user name is not found"
          })
      }
    },
    submit: function () {
      if (this.submitting) {
        return
      }
      const payment = this.payment
      payment.amount = Number(this.payment.amount)
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
    destinationError: function () {
      return this.destination.status === DESTINATION_CHECK_FAIL
    },
  },
}
</script>

<style scoped></style>
