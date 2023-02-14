<template>
  <q-form class="q-ma-md">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <q-field label="The receiver" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{ payment.requesterName }}</div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="The sender" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.contactMethod === "internal" ? payment.senderName : payment.senderEmail }}
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
      <div class="col-12">
        <q-field :label="`Payment address (${payment.paymentMethod})`" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.paymentAddress }}
            </div>
          </template>
        </q-field>
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
        <div class="text-h6">Description</div>
        <div>
          {{ payment.description }}
        </div>
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
      <q-btn
        label="Cancel"
        type="button"
        color="white"
        text-color="black"
        @click="$router.push({ name: 'payment.list' })"
      />
    </div>
  </q-form>
</template>

<script>
import MDate from "components/common/mDate"
export default {
  name: "paymentDetail",
  components: { MDate },
  data() {
    return {
      processing: false,
      txId: "",
      fetchingRate: false,
      paying: false,
    }
  },
  props: {
    payment: Object,
    user: Object,
  },
  methods: {
    queryRate() {
      const token = this.$route.query.token || ""
      const reqData = {
        id: this.payment.id,
        token,
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
        token: this.$route.query.token || "",
      }
      this.$api
        .post("/payment/process", reqData)
        .then((res) => {
          this.paying = false
          this.$emit("update", res.data.data)
        })
        .catch((err) => {
          this.paying = false
        })
    },
  },
  watch: {
    payment(newPayment) {
      this.txId = newPayment.txId
    },
  },
  computed: {
    editable() {
      return this.payment.status === "created" && this.payment.requesterId === this.user.id
    },
    processable() {
      return this.payment.status === "created" && (this.payment.senderId === this.user.id || this.$route.query.token)
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
