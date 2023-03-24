<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-form class="q-ma-md" @submit="markAsPaid">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <q-field label="The sender" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.senderName || payment.externalEmail }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="The recipient" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.receiverName || payment.externalEmail }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-select
          v-if="processing"
          v-model="payment.status"
          :options="statuses"
          outlined
          dense
          lazy-rules
          stack-label
          emit-value
          map-options
          label="Status"
          :rules="[(val) => !!val || 'Status is required']"
        />
        <q-field v-else label="Status" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <payment-status
                :status="payment.status"
                :receiver-id="payment.receiverId"
              />
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
        <PaymentRateInput
          :readonly="!processing"
          ref="rateInput"
          v-model="payment"
          v-model:loading="fetchingRate"
          @update:modelValue="updateLocal"
        />
      </div>
      <div class="col-4">
        <q-field
          :label="`Amount to send(${payment.paymentMethod})`"
          stack-label
        >
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.expectedAmount }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-select
          v-if="processing"
          v-model="payment.paymentMethod"
          :options="methods"
          outlined
          dense
          lazy-rules
          stack-label
          label="Payment method"
          @update:modelValue="methodChange"
          :rules="[(val) => !!val || 'Payment method is required']"
        />
        <q-field v-else label="Payment method" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.paymentMethod }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-8">
        <q-field
          :label="`Payment address (${payment.paymentMethod})`"
          stack-label
        >
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.paymentAddress }}
            </div>
          </template>
        </q-field>
      </div>
      <div
        v-if="payment.paymentSettings && payment.paymentSettings.length"
        class="col-12"
      >
        <payment-setting
          :modelValue="payment.paymentSettings"
          readonly
          label="Accepted payment settings"
        />
      </div>
      <div class="col-12">
        <q-input
          v-if="processing"
          v-model="txId"
          label="Transaction id"
          ref="txId"
          outlined
          dense
          lazy-rules
          stack-label
        />
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
        <PaymentInvoiceMode ref="invoiceMode" v-model="payment" readonly />
      </div>
    </div>
    <div class="row justify-end q-mt-lg">
      <q-btn
        v-if="processable && processing"
        label="save"
        type="button"
        color="primary"
        :disable="fetchingRate || paying"
        class="q-mr-sm"
        @click="update"
      />
      <q-btn
        v-if="processable && processing"
        label="paid"
        type="submit"
        color="primary"
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
      <q-btn
        v-if="editable && !processing"
        label="Edit"
        type="button"
        color="primary"
        @click="$emit('update:editing', true)"
        class="q-mr-sm"
      />
      <q-btn
        label="Cancel"
        type="button"
        color="white"
        text-color="black"
        @click="cancel"
      />
    </div>
  </q-form>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import MDate from "components/common/mDate";
import PaymentSetting from "components/payment/paymentSetting";
import { PAYMENT_OBJECT_REQUEST } from "src/consts/paymentType";
import { responseError } from "src/helper/error";
import PaymentStatus from "components/payment/paymentStatus";
import PaymentRateInput from "components/payment/paymentRateInput";
import PaymentInvoiceMode from "components/payment/paymentInvoiceMode";
export default {
  name: "paymentDetail",
  components: {
    MDate,
    PaymentSetting,
    PaymentStatus,
    PaymentRateInput,
    PaymentInvoiceMode,
  },
  data() {
    return {
      txId: "",
      pMethod: "",
      methods: [],
      statuses: [
        {
          label: "Received",
          value: "sent",
        },
        {
          label: "Ready for Payment",
          value: "confirmed",
        },
      ],
      expanded: false,
      processing: false,
      fetchingRate: false,
      paying: false,
      payment: {},
    };
  },
  props: {
    modelValue: Object,
    user: Object,
    token: String,
    paymentType: String,
    editing: Boolean,
  },
  methods: {
    ...mapActions({
      savePayment: "payment/save",
    }),
    cancel() {
      if (this.processing) {
        this.processing = false;
        return;
      }
      const path =
        this.paymentType === PAYMENT_OBJECT_REQUEST ? "get-paid" : "pay";
      this.$router.push({ path: `/${path}` });
    },
    processPayment() {
      this.processing = true;
      if (this.payment.paymentMethod !== "none") {
        this.$refs.rateInput.fetchRate();
      }
    },
    markAsPaid() {
      const txId = this.txId.trim();
      if (
        txId.length === 0 &&
        !confirm(
          "Are you sure to mark the payment as paid? Fill up txId will make the requester confirm your payment easier"
        )
      ) {
        this.$refs.txId.$el.focus();
        return;
      }
      const reqData = {
        id: this.payment.id,
        txId: txId,
        token: this.token,
        paymentMethod: this.payment.paymentMethod,
        paymentAddress: this.payment.paymentAddress,
      };
      this.$api
        .post("/payment/process", reqData)
        .then((data) => {
          this.paying = false;
          this.$emit("update:modelValue", data);
          this.$q.notify({
            message: "payment has been payed",
            color: "positive",
            icon: "check",
          });
        })
        .catch((err) => {
          this.paying = false;
          responseError(err);
        });
    },
    async update() {
      const form = {
        ...this.payment,
        token: this.token,
        txId: this.txId,
      };
      this.paying = true;
      const { data } = await this.savePayment(form);
      this.paying = false;
      if (data) {
        this.updateLocal(data.payment);
        this.$q.notify({
          message: "payment is updated",
          color: "positive",
          icon: "check",
        });
      }
    },
    updateLocal(payment, editing) {
      payment = payment || this.payment;
      this.$emit("update:modelValue", payment);
      if (editing) {
        this.$emit("update:editing", true);
      }
    },
    methodChange(method) {
      const settings = this.payment.paymentSettings || [];
      const setting = settings.find((s) => s.type === method);
      if (setting) {
        this.payment.paymentAddress = setting.address;
      }
      this.$refs.rateInput.fetchRate();
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newPayment) {
        this.txId = newPayment.txId;
        this.pMethod = newPayment.paymentMethod;
        let settings = newPayment.paymentSettings || [];
        this.methods = settings.map((s) => s.type);
        this.payment = { ...newPayment };
        // setup default payment method
        const paymentSettings = this.payment.paymentSettings || [];
        if (this.payment.paymentMethod === "none" && paymentSettings.length) {
          let setting = paymentSettings[0];
          for (let ps of paymentSettings) {
            if (ps.isDefault) {
              setting = ps;
              break;
            }
          }
          this.payment.paymentMethod = setting.type;
          this.payment.paymentAddress = setting.address;
        }
      },
    },
  },
  computed: {
    ...mapGetters({
      role: "user/getRole",
    }),
    editable() {
      return (
        ["draft", "sent", "confirmed"].indexOf(this.payment.status) !== -1 &&
        this.payment.senderId === this.user.id
      );
    },
    processable() {
      return (
        ["draft", "sent", "confirmed"].indexOf(this.payment.status) !== -1 &&
        (this.payment.receiverId === this.user.id ||
          (this.token && this.payment.receiverId === 0))
      );
    },
  },
};
</script>

<style scoped></style>
