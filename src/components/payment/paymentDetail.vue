<template>
  <q-form class="q-ma-md">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <q-field label="The receiver" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{payment.receiverName || payment.externalEmail}}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="The sender" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{payment.senderName || payment.externalEmail}}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Status" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.status }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Amount(USD)" stack-label>
          <template v-slot:prepend>
            <q-icon name="attach_money" />
          </template>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.amount }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Convert Rate" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.convertRate }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field :label="`Amount to send(${payment.paymentMethod})`" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.expectedAmount }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-select v-if="processing"
          v-model="payment.paymentMethod"
          :options="methods"
          label="Payment method"
          @input="methodChange"
        />
        <q-field v-else label="Payment method" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{payment.paymentMethod}}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-8">
        <q-field :label="`Payment address (${payment.paymentMethod})`" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.paymentAddress }}
            </div>
          </template>
        </q-field>
      </div>
      <div v-if="payment.paymentSettings && payment.paymentSettings.length" class="col-12">
        <payment-setting :value="payment.paymentSettings" readonly label="Accepted payment settings"/>
      </div>
      <div class="col-12">
        <q-input v-if="processing" v-model="txId" label="Transaction id" ref="txId" />
        <q-field v-if="!processing" label="Transaction id" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.txId }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-3">
        <q-field label="Created At" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <m-date :date="payment.createdAt"></m-date>
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-3">
        <q-field label="Paid At" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <m-date :date="payment.paidAt"></m-date>
            </div>
          </template>
        </q-field>
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
                readonly
                type="number"
                v-model="payment.hourlyRate"
                hint="Used to calculate cost from hours on invoices"
              />
            </div>
          </div>
          <invoices v-model="payment.details" :hourlyRate="Number(payment.hourlyRate)" readonly></invoices>
        </q-expansion-item>
      </div>
    </div>
    <div class="row justify-end q-mt-lg">
      <q-btn
        v-if="processable && processing"
        :label="fetchRateLabel"
        type="button"
        color="primary"
        @click="queryRate"
        :disable="fetchingRate || paying"
        class="q-mr-sm"
      />
      <q-btn
        v-if="processable && processing"
        label="Mark as paid"
        type="button"
        color="primary"
        @click="markAsPaid"
        :disable="fetchingRate || paying"
        class="q-mr-sm"
      />
      <q-btn
        v-if="processable && !processing"
        label="Process Payment"
        type="button"
        color="primary"
        @click="processPayment"
        class="q-mr-sm"
      />
      <q-btn v-if="editable" label="Edit" type="button" color="primary" @click="$emit('edit')" />
      <q-btn label="Cancel" type="button" color="white" text-color="black" @click="goToList" />
    </div>
  </q-form>
</template>

<script>
import { mapGetters } from "vuex"
import MDate from "components/common/mDate"
import Invoices from "components/payment/invoices"
import PaymentSetting from "components/payment/paymentSetting";
export default {
  name: "paymentDetail",
  components: { MDate, Invoices, PaymentSetting },
  data() {
    return {
      txId: "",
      pMethod: "",
      methods: [],
      expanded: false,
      processing: false,
      fetchingRate: false,
      paying: false,
    }
  },
  props: {
    payment: Object,
    user: Object,
    token: String
  },
  methods: {
    goToList() {
      this.$router.push({ name: `${this.role}.payment.list` })
    },
    queryRate() {
      const reqData = {
        id: this.payment.id,
        paymentMethod: this.payment.paymentMethod,
        paymentAddress: this.payment.paymentAddress,
        token: this.token,
      }
      this.fetchingRate = true
      this.$api
        .post("/payment/request-rate", reqData)
        .then((res) => {
          this.fetchingRate = false
          this.$emit("update", res.data.data)
        })
        .catch((err) => {
          this.fetchingRate = false
        })
    },
    processPayment() {
      this.processing = true
      this.queryRate()
    },
    markAsPaid() {
      const txId = this.txId.trim()
      if (
        txId.length === 0 &&
        !confirm(
          "Are you sure to mark the payment as paid? Fill up txId will make the requester confirm your payment easier"
        )
      ) {
        this.$refs.txId.$el.focus()
        return
      }
      const reqData = {
        id: this.payment.id,
        txId: txId,
        token: this.token,
        paymentMethod: this.payment.paymentMethod,
        paymentAddress: this.payment.paymentAddress
      }
      this.$api
        .post("/payment/process", reqData)
        .then((res) => {
          this.paying = false
          this.$emit("update", res.data.data)
          this.$q.notify({
            message: "payment has been payed",
            color: "positive",
            icon: "check",
          })
        })
        .catch((err) => {
          this.paying = false
        })
    },
    methodChange(method) {
      const settings = this.payment.paymentSettings || []
      const setting = settings.find(s => s.type === method)
      if (setting) {
        this.payment.paymentAddress = setting.address
      }
      this.queryRate()
    }
  },
  watch: {
    payment: {
      immediate: true,
      handler(newPayment) {
        this.txId = newPayment.txId
        this.pMethod = newPayment.paymentMethod
        let settings = newPayment.paymentSettings || []
        this.methods = settings.map(s => s.type)
      }
    }
  },
  computed: {
    ...mapGetters({
      role: "auth/getRole",
    }),
    editable() {
      return (this.payment.status === "created" || this.payment.status === "sent") &&
        (this.payment.senderId === this.user.id || this.payment.receiverId === this.user.id);
    },
    processable() {
      return (this.payment.status === "created" || this.payment.status === "sent") &&
        (this.payment.senderId === this.user.id || this.$route.query.token)
    },
    fetchRateLabel() {
      if (this.fetchingRate) {
        return "Fetching Rate"
      }
      return "Re-fetch rate"
    },
  },
}
</script>

<style scoped></style>
