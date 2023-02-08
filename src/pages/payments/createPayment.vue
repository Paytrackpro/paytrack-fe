<template>
  <q-card flat bordered class="q-pa-md">
    <q-form @submit="submit">
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12">
          <p class="q-mt-none q-mb-xs text-weight-medium">The destination you want to send</p>
          <q-input
            v-model="destination"
            placeholder="Destination"
            outlined
            dense
            lazy-rules
            stack-label
            hide-bottom-space
            @blur="checkingDestination"
            :rules="[ val => !!val || 'Destination is required' ]"
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
            :rules="[ val => val > 0 || 'Amount must be greater than 0'  ]"
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
            :rules="[ val => !!val || 'Currency is required'  ]"
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
            :rules="[ val => !!val || 'Address is required'  ]"
            placeholder="payment address"
            outlined
            dense
            lazy-rules
            stack-label
            hide-bottom-space
          />
        </div>
        <div class="col-12 ">
          <p class="q-mt-none q-mb-xs text-weight-medium">Tell more about your payment request</p>
          <q-input
            v-model="payment.description"
            :rules="[ val => !!val || 'Description is required'  ]"
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
        <q-btn label="Send" type="submit" color="primary" />
        <q-btn label="Cancel" type="submit" color="white" text-color="black"/>
      </div>
    </q-form>
  </q-card>
</template>

<script>
import {emailPattern} from "src/helper/validations";
const DESTINATION_CHECK_NONE = 0;
const DESTINATION_CHECK_CHECKING = 1;
const DESTINATION_CHECK_DONE = 2;

export default {
  name: "createPayment",
  data() {
    return {
      userCheck: DESTINATION_CHECK_NONE,
      destination: "",
      payment: {
        contactMethod: "internal",
        senderId: 0,
        amount: "",
        senderEmail: "",
        description: "",
        txId: "",
        paymentMethod: "",
        paymentAddress: ""
      },
      paymentMethods: [
        {value: "btc",label: "BTC"},
        {value: "dcr",label: "DCR"},
      ],
    }
  },
  methods: {
    checkingDestination: function ($e) {
      this.userCheck = DESTINATION_CHECK_NONE;
      if(this.destination.length === 0) {
        return
      }
      if(emailPattern.test(this.destination)) {
        this.userCheck = DESTINATION_CHECK_DONE;
        this.payment.contactMethod = "email"
        this.payment.senderEmail = this.destination
      } else {
        this.userCheck = DESTINATION_CHECK_CHECKING;
        this.$api.get(`/user/exist-checking?userName=${this.destination}`)
          .then((res) => {
            console.log(res)
            this.userCheck = DESTINATION_CHECK_DONE;
          })
          .catch(() => {
            this.userCheck = DESTINATION_CHECK_NONE;
          })
      }
    },
    submit:function () {
      this.$api
        .post(`/payment`, {
          userId: parseInt(this.$route.params.id),
          email: this.email,
          paymentAddress: this.paymentAddress,
          paymentType: this.paymentType,
        })
        .then(() => {
          this.$q.notify({
            message: "User saved",
            color: "positive",
            icon: "check",
          })
          this.$router.push({ name: "UserList" })
        })
        .catch(() => {
          this.$q.notify({
            message: "Error",
            color: "negative",
            icon: "alert",
          })
        })
      console.log(this.payment, this.users)
    }
  }
}
</script>

<style scoped>

</style>
